# hono-task-api

A small REST API built with [Hono](https://hono.dev) for managing tasks. Used as a sample application.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Health check |
| GET | `/tasks` | List tasks, in creation order; append `?limit=N` (positive integer) to return only the first N |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task (`{ "title": "..." }`) |

An invalid `limit` (non-numeric, zero, negative, or non-integer) returns `400 { "error": "limit must be a positive integer" }`; an absent or empty `limit` returns all tasks.

## Development

Follow this repository's own conventions. Install dependencies with the package manager indicated by the lockfile, then use the scripts in `package.json`.
