declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      username: string
      password: string
      created_at: string
    }
  }
}
