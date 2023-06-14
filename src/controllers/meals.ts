import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import dayjs from 'dayjs'
import crypto from 'crypto'

const userSchema = z.object({
  id: z.string(),
})

export const createMeal = async function (req: FastifyRequest) {
  const requestMealSchema = z.object({
    name: z.string(),
    description: z.string(),
    inDiet: z.boolean(),
    date: z.string(),
  })
  const { name, description, inDiet, date } = requestMealSchema.parse(req.body)
  const user = userSchema.parse(req.headers.user)

  const parsedDate = dayjs(date)
  if (!parsedDate.isValid()) {
    throw new Error('Date meal is not valid')
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
  return meals.map((e) => ({
    ...e,
    inDiet: e.inDiet === 1,
  }))
}

export const getMeal = async function (req: FastifyRequest) {
  const getMealParamsSchema = z.object({
    id: z.string().uuid(),
  })
  const { id: mealId } = getMealParamsSchema.parse(req.params)
  if (!mealId) {
    throw new Error('Meal id not sent')
  }

  const { id: userId } = userSchema.parse(req.headers.user)
  const meal = await knex('meals')
    .where('id', mealId)
    .andWhere('user_id', userId)
    .first()
  if (!meal) {
    throw new Error('Meal id is not valid')
  }

  return meal
}

export const editMeal = async function (req: FastifyRequest) {
  const editMealParamsSchema = z.object({
    id: z.string().uuid(),
  })
  const databaseMealSchema = z.object({
    name: z.string(),
    description: z.string(),
    inDiet: z.number(),
    date: z.string(),
  })
  const requestMealSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    inDiet: z.boolean().optional(),
    date: z.string().optional(),
  })

  const { id: mealId } = editMealParamsSchema.parse(req.params)
  if (!mealId) {
    throw new Error('Meal id not sent')
  }

  const { id: userId } = userSchema.parse(req.headers.user)
  const oldMeal = databaseMealSchema.parse(
    await knex('meals').where('id', mealId).andWhere('user_id', userId).first(),
  )
  if (!oldMeal) {
    throw new Error('Meal id is not valid')
  }

  const newMeal = requestMealSchema.parse(req.body)

  await knex('meals')
    .where('id', mealId)
    .update({
      name: newMeal.name ? newMeal.name : oldMeal.name,
      description: newMeal.description
        ? newMeal.description
        : oldMeal.description,
      date: newMeal.date ? newMeal.date : oldMeal.date,
      inDiet:
        newMeal.inDiet !== null && newMeal.inDiet !== undefined
          ? newMeal.inDiet
          : oldMeal.inDiet === 1,
    })
}

export const deleteMeal = async function (req: FastifyRequest) {
  const deleteMealParamsSchema = z.object({
    id: z.string().uuid(),
  })
  const { id: mealId } = deleteMealParamsSchema.parse(req.params)
  if (!mealId) {
    throw new Error('Meal id not sent')
  }

  const { id: userId } = userSchema.parse(req.headers.user)
  const meal = await knex('meals')
    .where('id', mealId)
    .andWhere('user_id', userId)
    .first()
  if (!meal) {
    throw new Error('Meal id is not valid')
  }

  await knex('meals').where('id', mealId).update({
    deleted: dayjs().format(),
  })
}
