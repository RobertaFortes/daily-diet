import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

type CountResult = { count: string }

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
    const { sessionId } = request.cookies

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
      const { sessionId } = request.cookies

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
      const { sessionId } = request.cookies
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = deleteMealParamsSchema.parse(request.params)

      await knex('meals').where({ id, session_id: sessionId }).delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const total = (await knex('meals')
        .where({ session_id: sessionId })
        .count('id as count')
        .first()) as CountResult | undefined

      const onDiet = (await knex('meals')
        .where({ session_id: sessionId, is_on_diet: true })
        .count('id as count')
        .first()) as CountResult | undefined

      const offDiet = (await knex('meals')
        .where({ session_id: sessionId, is_on_diet: false })
        .count('id as count')
        .first()) as CountResult | undefined

      const meals = await knex('meals')
        .where({ session_id: sessionId })
        .orderBy('date_time', 'asc')

      let bestStreak = 0
      let currentStreak = 0

      for (const meal of meals) {
        if (meal.is_on_diet) {
          currentStreak++
          bestStreak = Math.max(bestStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      }

      return reply.send({
        totalMeals: Number(total?.count ?? 0),
        mealsOnDiet: Number(onDiet?.count ?? 0),
        mealsOffDiet: Number(offDiet?.count ?? 0),
        bestStreakOnDiet: bestStreak,
      })
    },
  )
}
