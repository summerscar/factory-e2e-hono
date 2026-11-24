import { Hono } from 'hono'
import { tasksRoute } from './routes/tasks'

const app = new Hono()

app.get('/', (c) => c.json({ name: 'hono-task-api', status: 'ok' }))

app.get('/probe', (c) => c.json({ ok: true }))

app.route('/tasks', tasksRoute)

export default app
