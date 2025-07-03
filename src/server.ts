import { app } from './app'
import { env } from './env'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('Server running on http://0.0.0.0:3333')
  })
  .catch((err) => {
    console.error('Error starting server:', err)
  })
