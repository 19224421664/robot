# Robot

A lightweight, TypeScript-based robot framework for running scheduled background tasks with structured logging and a built-in health endpoint.

## Features

- **Task scheduling** — run tasks on fixed intervals
- **Structured logging** — JSON-formatted logs with configurable levels
- **Error recovery** — automatic retries with configurable limits
- **Health endpoint** — built-in HTTP health-check server

## Getting Started

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

| Variable         | Default | Description                         |
|------------------|---------|-------------------------------------|
| `LOG_LEVEL`      | `info`  | Log verbosity (`debug/info/warn/error`) |
| `HEALTH_PORT`    | `3000`  | Port for the health-check server    |
| `RETRY_MAX`      | `3`     | Max retry attempts per task failure |
| `RETRY_DELAY_MS` | `1000`  | Delay (ms) between retries          |

### Run

```bash
# Development (ts-node)
npm run dev

# Production build
npm run build
npm start
```

### Test

```bash
npm test
```

## Project Structure

```
src/
  index.ts          # entrypoint — loads .env and starts the robot
  robot.ts          # core Robot class
  scheduler.ts      # task scheduler
  logger.ts         # structured logger
  health.ts         # health-check HTTP server
  tasks/
    example.ts      # example built-in task
tests/
  robot.test.ts     # unit tests
.env.example        # sample environment variables
```

## Writing a Custom Task

Implement the `Task` interface and register it before calling `robot.start()`:

```typescript
import { Robot, Task } from './src/robot';

const myTask: Task = {
  name: 'my-task',
  intervalMs: 30_000,   // run every 30 seconds
  run: async (logger) => {
    logger.info('doing work');
    // ... your logic here
  },
};

const robot = new Robot({ healthPort: 3000 });
robot.schedule(myTask);
robot.start();
```

## Health Endpoint

Once running, check health at:

```
GET http://localhost:3000/health
```

Response example:

```json
{
  "status": "ok",
  "uptime": 42,
  "tasks": {
    "heartbeat": { "status": "ok", "lastRun": "2024-01-01T00:00:00.000Z" }
  }
}
```

## License

MIT
