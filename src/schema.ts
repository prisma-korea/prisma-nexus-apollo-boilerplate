import * as models from './models';
import * as path from 'path';
import * as resolvers from './resolvers';

import { makeSchema } from 'nexus';
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema';

export const schema = makeSchema({
  types: {
    resolvers,
    models,
  },
  plugins: [
    nexusSchemaPrisma({
      outputs: {
        typegen: path.join(__dirname, 'generated/typegen-nexus-plugin-prisma.d.ts'),
      },
    }),
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
