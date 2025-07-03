import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const meals = await knex('meals').where('session_id', sessionId).select()
      return {
        meals,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getMealParamsSchema.parse(request.params)
      const { sessionId } = request.cookies
      const meal = await knex('meals')
        .where({
          session_id: sessionId,
          id,
        })
        .first()
      if (!meal) {
        return reply.status(404).send({ message: 'Meal not found' })
      }
      return {
        meal,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const summary = await knex('transactions')
        .where({
          session_id: sessionId,
        })
        .sum('amount', { as: 'amount' })
        .first()
      return {
        summary,
      }
    },
  )

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      isOnDiet: z.boolean(),
    })

    const { name, description, date, time, isOnDiet } =
      createMealBodySchema.parse(request.body)
    const [day, month, year] = date.split('/')
    const dateTime = new Date(`${year}-${month}-${day}T${time}:00`)
    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date_time: dateTime.toISOString(),
      is_on_diet: isOnDiet,
      session_id: sessionId,
      created_at: new Date().toISOString(),
    })
    return reply.status(201).send()
  })

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        isOnDiet: z.boolean(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)
      const { name, description, date, time, isOnDiet } =
        updateMealBodySchema.parse(request.body)

      const [day, month, year] = date.split('/')
      const dateTime = new Date(`${year}-${month}-${day}T${time}:00`)
      const sessionId = request.cookies.sessionId

      if (!sessionId) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      await knex('meals').where({ id, session_id: sessionId }).update({
        name,
        description,
        date_time: dateTime.toISOString(),
        is_on_diet: isOnDiet,
        updated_at: new Date().toISOString(),
      })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = deleteMealParamsSchema.parse(request.params)

      if (!sessionId) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
      await knex('meals').where({ id, session_id: sessionId }).delete()

      return reply.status(204).send()
    },
  )
}
