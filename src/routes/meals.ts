import { FastifyInstance } from 'fastify'
import { checkUserToken } from '../middlewares/check-user-token'
import { createMeal, getMeals } from '../controllers/meals'

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
}
