import { z } from 'zod'
import { FastifyRequest } from 'fastify'
import { knex } from '../database'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { env } from '../env/index'

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
    password: crypto.createHash('sha256').update(password).digest('base64'),
  })
}

export async function token(req: FastifyRequest) {
  const createUserSchema = z.object({
    username: z.string(),
    password: z.string(),
  })

  const { username, password } = createUserSchema.parse(req.body)

  const hashPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('base64')
  const user = await knex('users')
    .select('*')
    .where('username', username)
    .andWhere('password', hashPassword)
    .first()
  if (!user) {
    throw new Error('User does not exist')
  }

  const token = jwt.sign({ id: user.id }, env.SECRET, {
    expiresIn: '365d',
  })
  return token
}
