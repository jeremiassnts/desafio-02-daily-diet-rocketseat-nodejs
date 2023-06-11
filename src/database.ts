import { Knex, knex as setupKnex } from 'knex'
import { env } from './env/index'
import path from 'path'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.NODE_ENV === 'test'
      ? {
          filename: path.join(__dirname, env.DATABASE_URL),
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: path.join(__dirname, '../db/migrations'),
  },
}

export const knex = setupKnex(config)
