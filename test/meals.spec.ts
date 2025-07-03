import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')

    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .expect(201)
    const cookies = createUserResponse.get('Set-Cookie')
    if (!cookies) {
      throw new Error('Cookies not found in response')
    }
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Sanduíche',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date: '12/08/2022',
        time: '16:00',
        isOnDiet: true,
      })
      .expect(201)
  })

  it('should be able to get all meals', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .expect(201)
    const cookies = createUserResponse.get('Set-Cookie')
    if (!cookies) {
      throw new Error('Cookies not found in response')
    }
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Sanduíche',
      description:
        'Sanduíche de pão integral com atum e salada de alface e tomate',
      date: '12/08/2022',
      time: '16:00',
      isOnDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)
    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Sanduíche',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        date_time: 1660312800000,
        is_on_diet: 1,
      }),
    ])
  })
})
