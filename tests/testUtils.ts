import { ApolloClient } from 'apollo-client';
import { GraphQLClient } from 'graphql-request';
import { Http2Server } from 'http2';
import { PrismaClient } from '@prisma/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { assert } from '../src/utils/assert';

export interface TestUtils {
  apolloClient: ApolloClient<any>;
  server: Http2Server;
  prisma: PrismaClient;
  graphqlClient: GraphQLClient;
  networkInterface: SubscriptionClient;
  updateGraphqlClient?: (client: GraphQLClient) => void;
}

let _testUtils: TestUtils | undefined;

export function getTestUtils(): TestUtils {
  assert(_testUtils, 'Test utilities are not initialized.');

  _testUtils.updateGraphqlClient = (client: GraphQLClient) => {
    _testUtils.graphqlClient = client;
  };

  return _testUtils;
}

export function setTestUtils(value: TestUtils): void {
  _testUtils = value;
}
