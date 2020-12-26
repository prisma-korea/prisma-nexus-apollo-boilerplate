# ts-apollo-prisma

[![CircleCI](https://circleci.com/gh/dooboolab/ts-apollo-prisma.svg?style=svg)](https://circleci.com/gh/dooboolab/ts-apollo-prisma)
[![codecov](https://codecov.io/gh/dooboolab/ts-apollo-prisma/branch/master/graph/badge.svg)](https://codecov.io/gh/dooboolab/ts-apollo-prisma)

> Boilerplate for typescript apollo server using prisma (known as Prisma 2).

## Specification
* [node](https://nodejs.org)
* [typescript](https://typescriptlang.org)
* [prisma](https://www.prisma.io)
* [prisma-nexus](https://www.nexusjs.org/#/components/schema/plugins/prisma)
* [apollo-server](https://www.apollographql.com/docs/apollo-server)
* [jest](https://jestjs.io)

## Setup environment
1. cp `./dotenv/dev.env` `./dotenv/.env`
2. Include `DATABASE_URL`
   ```
   DATABASE_URL="postgresql://<user>:<password>!@<url>:5432/postgres?schema=<scheme>"
   ```
   > Note that you should change appropriate values in `user`, `password`, `url`, `scheme` fields. Or you can even use other database. More about [connection urls](https://www.prisma.io/docs/reference/database-connectors/connection-urls)
3. Running `yarn local` will load `env` from `dotenv/.env`.

## Generate Prisma Client and Nexus
```
yarn generate
```

## Migration

#### Init migration

1. Change models in `schema.prisma`.
   > Note that `prisma/migrations` dir is included in `.gitignore` in this repo but it should not be ignored in production.
2. Run migration script.
   > Note that this should be targeting the production database. Locally, you can just run `yarn db-push`.
   ```
   yarn migrate
   ```
3. Deploy migration to production.
   > Note you may want to run `yarn migrate:dev` beforhand to test your migration.
   ```
   yarn migrate:deploy
   ```

#### Create test user
```sh
➜  ~ createuser --interactive --pwprompt
Enter name of role to add: test
Enter password for new role: 
Enter it again: 
Shall the new role be a superuser? (y/n) y
```