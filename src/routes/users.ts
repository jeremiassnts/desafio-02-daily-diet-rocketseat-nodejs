import { FastifyInstance } from 'fastify'
import { createUser, token as getToken, getUserMetrics } from '../controllers/users'
import { checkUserToken } from '../middlewares/check-user-token'

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
  // token
  app.post('/token', async (req, res) => {
    let token = null
    try {
      token = await getToken(req)
    } catch (err) {
      return res.status(400).send(err)
    }
    return res.status(200).send({
      token,
    })
  })
  // get user metrics
  app.get('/metrics', { preHandler: [checkUserToken] }, async (req, res) => {
    try {
   const metrics=   await getUserMetrics(req)
      return res.status(200).send(metrics)
    } catch (err) {
      return res.status(400).send(err)
    }
  })
}
