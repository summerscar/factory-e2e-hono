import { Hono } from 'hono'
import { tasksRoute } from './routes/tasks'

const app = new Hono()

app.get('/', (c) => c.json({ name: 'hono-task-api', status: 'ok' }))

// Fixed literal test endpoint: returns the API path string.
app.get('/test/1', (c) => c.text('/test/1'))

app.route('/tasks', tasksRoute)

export default app
