import { ApolloClient, MutationOptions, SubscriptionOptions } from 'apollo-client';
import http2, { Http2Server } from 'http2';
// import http, { Server } from 'http';
import { AddressInfo } from 'net';
import { FetchResult } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import NodeWebSocket from 'ws';
import { Observable } from 'apollo-client/util/Observable';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from 'apollo-link-ws';
import { format } from 'url';

export interface ServerInfo {
  address: string;
  family: string;
  url: string;
  subscriptionsUrl: string;
  port: number | string;
  subscriptionsPath: string;
  server: Http2Server;
}

export interface PubSubClient {
  subscribe(options: SubscriptionOptions): Observable<any>;
  mutate(options: MutationOptions): Promise<FetchResult>;
  close(isForced?: boolean, closedByUser?: boolean): void;
}

export default function createPubSubClient(
  server: Http2Server,
  subscriptionsPath?: string,
): PubSubClient {
  const { subscriptionsUrl }: ServerInfo = createServerInfo(server, subscriptionsPath);
  const subscriptionClient = new SubscriptionClient(
    subscriptionsUrl,
    { reconnect: true },
    NodeWebSocket,
  );
  const apolloClient = new ApolloClient({
    link: new WebSocketLink(subscriptionClient),
    cache: new InMemoryCache(),
  });
  return {
    subscribe: (options: SubscriptionOptions): Observable<any> => apolloClient.subscribe(options),
    mutate: (options: MutationOptions): Promise<FetchResult> => apolloClient.mutate(options),
    close: (): void => subscriptionClient.close(),
  };
}

/**
 * Referenced from
 * github.com/apollographql/apollo-server/blob/master/packages/apollo-server/src/index.ts#L41
 */
function createServerInfo(
  server: Http2Server,
  subscriptionsPath?: string,
): ServerInfo {
  const serverInfo: any = {
    ...server.address() as AddressInfo,
    server,
    subscriptionsPath,
  };

  // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
  // corresponding loopback ip. Note that the url field we're setting is
  // primarily for consumption by our test suite. If this heuristic is
  // wrong for your use case, explicitly specify a frontend host (in the
  // `frontends.host` field in your engine config, or in the `host`
  // option to ApolloServer.listen).
  let hostForUrl = serverInfo.address;
  if (serverInfo.address === '' || serverInfo.address === '::') {
    hostForUrl = 'localhost';
  }

  serverInfo.subscriptionsUrl = format({
    protocol: 'ws',
    hostname: hostForUrl,
    port: serverInfo.port,
    slashes: true,
    pathname: subscriptionsPath,
  });

  return serverInfo;
}
