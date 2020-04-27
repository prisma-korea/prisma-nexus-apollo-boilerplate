import { GraphQLDate } from 'graphql-iso-date';
import { GraphQLUpload } from 'graphql-upload';
// import { Kind } from 'graphql';
// import { scalarType } from '@nexus/schema';

// export const DateScalar = scalarType({
//   name: 'Date',
//   asNexusMethod: 'date',
//   description: 'Date custom scalar type',
//   parseValue(value) {
//     return new Date(value);
//   },
//   serialize(value) {
//     return value.getTime();
//   },
//   parseLiteral(ast) {
//     if (ast.kind === Kind.INT) {
//       return new Date(ast.value);
//     }
//     return null;
//   },
// });

export const Upload = GraphQLUpload;
export const DateTime = GraphQLDate;
