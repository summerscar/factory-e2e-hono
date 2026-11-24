import { Hono } from 'hono'
import { tasksRoute } from './routes/tasks'
import pkg from '../package.json' with { type: 'json' }

const app = new Hono()

app.get('/', (c) => c.json({ name: 'hono-task-api', status: 'ok' }))

app.get('/version', (c) => c.json({ name: pkg.name, version: pkg.version }))

app.route('/tasks', tasksRoute)

export default app
