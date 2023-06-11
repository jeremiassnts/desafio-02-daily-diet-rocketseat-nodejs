import { z } from 'zod'
import { FastifyRequest } from 'fastify'
import { knex } from '../database'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

export async function createUser(req: FastifyRequest) {
  const createUserSchema = z.object({
    name: z.string(),
    username: z.string(),
    password: z.string(),
  })

  const { name, username, password } = createUserSchema.parse(req.body)
  // verifica se usuário já existe
  const user = await knex('users')
    .select('*')
    .where('username', username)
    .first()
  if (user) {
    throw new Error('Username already in use')
  }

  await knex('users').insert({
    id: crypto.randomUUID(),
    name,
    username,
    password: bcrypt.hashSync(password, 10),
  })
}
