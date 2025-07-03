# 🍽️ Daily Diet API

A RESTful API for tracking daily meals and retrieving diet-related metrics.

## 🚀 Tech Stack

- [Node.js](https://nodejs.org/)
- [Fastify](https://fastify.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Knex.js](https://knexjs.org/)
- [SQLite](https://sqlite.org/)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)

## 📦 Installation

```bash
npm install
cp .env.example .env
cp .env.test.example .env.test
```

## 🔧 Database Setup

```bash
npx knex migrate:latest
npx knex migrate:rollback --all
```

## 🏃 Running the Server

```bash
npm run dev
npm run build
```

## 🧪 Running Tests

```bash
npm run test
```

## 📬 API Endpoints

| Method | Route         | Description                              |
|--------|---------------|------------------------------------------|
| POST   | /users        | Start session (sets sessionId cookie)    |
| POST   | /meals        | Create a new meal                        |
| GET    | /meals        | List all meals for current session       |
| GET    | /meals/:id    | Get details of a specific meal           |
| PUT    | /meals/:id    | Update a meal                            |
| DELETE | /meals/:id    | Delete a meal                            |
| GET    | /metrics      | Get diet metrics for current session     |

## 🗂 Project Structure

```
db/
├── migrations/
├── app.db
├── test.db
src/
├── env/
├── middlewares/
├── routes/
├── types/
├── app.ts
├── server.ts
├── database.ts
test/
├── meals.spec.ts
.env
.env.example
.env.test
.env.test.example
```

## 💡 Notes

- Session-based authentication using a sessionId cookie.
- Metrics include total meals, in/out of diet, and best diet streak.
- Default database is SQLite. You can switch clients via .env.

### Functional requirements

- [x] It should be possible to create a user
- [x] It should be possible to record a meal
- [x] It should be possible to edit a meal
- [x] It should be possible to delete a meal
- [x] It should be possible to list all meals of a user
- [x] It should be possible to view a single meal
- [x] It should be possible to retrieve user metrics
  - Total number of meals recorded
  - Total number of meals within the diet
  - Total number of meals outside the diet
  - Best sequence of meals within the diet
  
### Business rules

- [x] Meals should be associated with a user
- [x] It should be possible to identify the user between requests
- [x] A user should only be able to view, edit, and delete meals they created
