import jwt from 'jsonwebtoken'
import { FastifyRequest } from 'fastify'
import { env } from '../env'
import { knex } from '../database'
import { z } from 'zod'

export const checkUserToken = async function (req: FastifyRequest) {
  const auth = req.headers.authorization as string
  if (!auth) {
    throw new Error('Invalid token')
  }
  const token = auth.split(' ')[1].trim()
  const jwtSchema = z.object({
    id: z.string(),
  })

  try {
    const data = jwtSchema.parse(jwt.verify(token, env.SECRET))
    if (!data) throw new Error()
    const user = await knex('users').where('id', data.id).first()
    if (!user) throw new Error()
  } catch (err) {
    throw new Error('Invalid token')
  }
}
