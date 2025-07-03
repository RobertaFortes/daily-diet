// File: src/types/knex.d.ts
import 'knex'
declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description?: string
      date_time: string
      is_on_diet: boolean
      created_at: string
      updated_at?: string
      session_id: string
    }
  }
}
