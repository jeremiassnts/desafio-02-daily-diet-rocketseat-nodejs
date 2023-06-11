import { FastifyInstance } from 'fastify'
import { createUser } from '../controllers/users'

export async function usersRoutes(app: FastifyInstance) {
  // create user
  app.post('/', async (req, res) => {
    try {
      await createUser(req)
    } catch (err) {
      return res.status(400).send(err)
    }
    return res.status(201).send()
  })
}
