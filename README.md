# hono-task-api

A small REST API built with [Hono](https://hono.dev) for managing tasks. Used as a sample application.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Health check |
| GET | `/tasks` | List all tasks |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task (`{ "title": "..." }`) |

## Development

Follow this repository's own conventions. Install dependencies with the package manager indicated by the lockfile, then use the scripts in `package.json`.

<!-- QA AI copy probe marker -->
