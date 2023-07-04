import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Meals routes tests', () => {
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

  it('should be able to create a meal', async () => {
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

    await request(app.server)
      .post('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .send({
        name: 'meal',
        description: 'meal description',
        inDiet: true,
        date: '2023-06-12 08:00:00',
      })
      .expect(201)
  })

  it('should be able to get user meals', async () => {
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

    await request(app.server)
      .post('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .send({
        name: 'meal',
        description: 'meal description',
        inDiet: true,
        date: '2023-06-12T08:00:00-03:00',
      })

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .expect(200)

    expect(getMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'meal',
        description: 'meal description',
        inDiet: true,
        date: '2023-06-12T08:00:00-03:00',
        deleted: null,
      }),
    ])
  })

  it('should be able to get a single user meal', async () => {
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

    await request(app.server)
      .post('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .send({
        name: 'meal',
        description: 'meal description',
        inDiet: true,
        date: '2023-06-12T08:00:00-03:00',
      })

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })

    const mealId = getMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get('/meals/' + mealId)
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        name: 'meal',
        description: 'meal description',
        inDiet: 1,
        date: '2023-06-12T08:00:00-03:00',
        deleted: null,
      }),
    )
  })

  it('should be able to edit a user meal', async () => {
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

    await request(app.server)
      .post('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .send({
        name: 'meal',
        description: 'meal description',
        inDiet: true,
        date: '2023-06-12T08:00:00-03:00',
      })

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })

    let meal = getMealsResponse.body.meals[0]
    meal = {
      ...meal,
      name: meal.name + '_edit',
      description: meal.description + '_edit',
      inDiet: meal.inDiet,
      date: '2023-01-01T00:00:00-03:00',
    }

    await request(app.server)
      .put('/meals/' + meal.id)
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .send(meal)
      .expect(200)

    const getMealResponse = await request(app.server)
      .get('/meals/' + meal.id)
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: meal.name,
        description: meal.description,
        inDiet: meal.inDiet ? 1 : 0,
        date: meal.date,
      }),
    )
  })

  it('should be able to delete a user meal', async () => {
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

    await request(app.server)
      .post('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .send({
        name: 'meal',
        description: 'meal description',
        inDiet: true,
        date: '2023-06-12T08:00:00-03:00',
      })

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })

    const mealId = getMealsResponse.body.meals[0].id

    await request(app.server)
      .delete('/meals/' + mealId)
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })
      .expect(200)

    const getMealResponse = await request(app.server)
      .get('/meals/' + mealId)
      .auth(getTokenResponse.body.token, {
        type: 'bearer',
      })

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        deleted: expect.any(String),
      }),
    )
  })
})
