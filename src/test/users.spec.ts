import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('User routes tests', () => {
  beforeAll(async () => {
    app.ready()
  })

  afterAll(async () => {
    app.close()
  })

  beforeEach(async () => {
    execSync('npm run migrate:rollback')
    execSync('npm run migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'test user',
        username: 'testuser',
        password: '12345',
      })
      .expect(201)
  })

  it('should be able to get a token', async () => {
    await request(app.server).post('/users').send({
      name: 'test user',
      username: 'testuser',
      password: '12345',
    })

    const getTokenResponse = await request(app.server)
      .post('/users/token')
      .send({
        username: 'testuser',
        password: '12345',
      })
      .expect(200)

    expect(getTokenResponse.body.token).not.toBeNull()
    expect(getTokenResponse.body.token).toBeTypeOf('string')
  })

  it('should be able to get the user metrics', async () => {
    await request(app.server).post('/users').send({
      name: 'test user',
      username: 'testuser',
      password: '12345',
    })

    const getTokenResponse = await request(app.server)
      .post('/users/token')
      .send({
        username: 'testuser',
        password: '12345',
      })

    const getMetricsResponse = await request(app.server)
      .get('/users/metrics')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .expect(200)

    expect(getMetricsResponse.body).toEqual({
      meals_total: 0,
      meals_in_diet_total: 0,
      meals_not_in_diet_total: 0,
      bestSequence: 0,
    })
  })
})
