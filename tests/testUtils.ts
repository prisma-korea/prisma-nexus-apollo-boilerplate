import { ApolloClient } from 'apollo-client';
import { GraphQLClient } from 'graphql-request';
import { Http2Server } from 'http2';
import { PrismaClient } from '@prisma/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { assert } from '../src/utils/assert';

export class TestUtils {
  public apolloClient: ApolloClient<any>;
  public server: Http2Server;
  public prisma: PrismaClient;
  public graphqlClient: GraphQLClient;
  public networkInterface: SubscriptionClient;

  constructor(
    apolloClient: ApolloClient<any>,
    server: Http2Server,
    prisma: PrismaClient,
    graphqlClient: GraphQLClient,
    networkInterfafce: SubscriptionClient,
  ) {
    this.apolloClient = apolloClient;
    this.server = server;
    this.prisma = prisma;
    this.graphqlClient = graphqlClient;
    this.networkInterface = networkInterfafce;
  }

  setAuthToken = (token: string): void => {
    this.graphqlClient.setHeader('Authorization', `Bearer ${token}`);
  }
}

let _testUtils: TestUtils | undefined;

export function getTestUtils(): TestUtils {
  assert(_testUtils, 'Test utilities are not initialized.');

  return _testUtils;
}

export function setTestUtils(value: TestUtils): void {
  _testUtils = value;
}
