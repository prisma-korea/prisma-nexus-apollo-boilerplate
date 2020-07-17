import { arg, asNexusMethod, core, enumType, scalarType } from '@nexus/schema';
import { GraphQLDate } from 'graphql-iso-date';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLUpload } from 'graphql-upload';

export const JSON = asNexusMethod(GraphQLJSON, 'json');
export function jsonArg(opts: core.NexusArgConfig<'JSON'>) {
  return arg({ ...opts, type: 'JSON' });
}

export const AuthType = enumType({
  name: 'AuthType',
  members: ['Email', 'Facebook', 'Google', 'Apple'],
});

enum GenderType {
  male = 'male',
  female = 'female',
}
export const Gender = scalarType({
  name: 'Gender',
  asNexusMethod: 'gender',
  parseValue(value: GenderType): GenderType {
    if (GenderType[value]) {
      return value;
    }
  },
  serialize(value) {
    return value;
  },
});

export const Upload = GraphQLUpload;
export const DateTime = GraphQLDate;
export const GQLDate = asNexusMethod(GraphQLDate, 'date');
