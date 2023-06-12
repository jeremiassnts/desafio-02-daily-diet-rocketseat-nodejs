import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import crypto from 'crypto'
import dayjs from 'dayjs'

const userSchema = z.object({
  id: z.string()
})

export const createMeal = async function (req: FastifyRequest) {
  const mealSchema = z.object({
    name: z.string(),
    description: z.string(),
    inDiet: z.boolean(),
    date: z.string()
  })

  const { name, description, inDiet, date } = mealSchema.parse(req.body)
  const user = userSchema.parse(req.headers.user)

  const parsedDate = dayjs(date)
  if(!parsedDate.isValid()){
    throw new Error("Date meal is not valid")
  }
  await knex('meals').insert({
    id: crypto.randomUUID(),
    name,
    description,
    date: parsedDate.format(),
    inDiet,
    deleted: null,
    user_id: user.id,
  })
}

export const getMeals = async function (req: FastifyRequest) {
  const user = userSchema.parse(req.headers.user)

  const meals = await knex('meals')
    .where('user_id', user.id)
    .andWhere('deleted', null)
  return meals
}
