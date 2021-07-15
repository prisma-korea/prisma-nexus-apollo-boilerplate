import * as path from 'path';
import * as types from './types';

import {connectionPlugin, fieldAuthorizePlugin, makeSchema} from 'nexus';

import {validationPlugin} from 'nexus-validation-plugin';

export const schema = makeSchema({
  types,
  plugins: [
    fieldAuthorizePlugin({
      formatError: (authConfig) => authConfig.error,
    }),
    connectionPlugin({
      cursorFromNode(node) {
        return node.id;
      },
    }),
    validationPlugin(),
  ],
  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },
  contextType: {
    module: path.join(__dirname, './context.ts'),
    export: 'Context',
  },
});
