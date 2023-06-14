import { FastifyInstance } from 'fastify'
import { checkUserToken } from '../middlewares/check-user-token'
import {
  createMeal,
  deleteMeal,
  editMeal,
  getMeal,
  getMeals,
} from '../controllers/meals'

export const mealsRoutes = async function (app: FastifyInstance) {
  // create meal
  app.post('/', { preHandler: [checkUserToken] }, async (req, res) => {
    try {
      await createMeal(req)
    } catch (err) {
      return res.status(400).send(err)
    }
    return res.status(201).send()
  })
  // get user meals
  app.get('/', { preHandler: [checkUserToken] }, async (req, res) => {
    try {
      const meals = await getMeals(req)
      return res.status(200).send({ meals })
    } catch (err) {
      return res.status(400).send(err)
    }
  })
  // get user meal
  app.get('/:id', { preHandler: [checkUserToken] }, async (req, res) => {
    try {
      const meal = await getMeal(req)
      return res.status(200).send({ meal })
    } catch (err) {
      return res.status(400).send(err)
    }
  })
  // put user meal
  app.put('/:id', { preHandler: [checkUserToken] }, async (req, res) => {
    try {
      await editMeal(req)
      return res.status(200).send()
    } catch (err) {
      return res.status(400).send(err)
    }
  })
  // delete user meal
  app.delete('/:id', { preHandler: [checkUserToken] }, async (req, res) => {
    try {
      await deleteMeal(req)
      return res.status(200).send()
    } catch (err) {
      return res.status(400).send(err)
    }
  })
}
