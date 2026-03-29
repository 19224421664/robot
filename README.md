# Robot 🤖

A lightweight, extensible automation robot framework built with TypeScript and Node.js.

## Features

- **Task scheduling** — run tasks on intervals or cron expressions
- **Plugin system** — easily extend with custom task handlers
- **Structured logging** — JSON-formatted logs with configurable levels
- **Error recovery** — automatic retry with exponential back-off
- **Health endpoint** — built-in HTTP health-check server

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

### Build & Run (production)

```bash
npm run build
npm start
```

### Tests

```bash
npm test
```

## Configuration

Copy `.env.example` to `.env` and adjust values:

```
LOG_LEVEL=info          # debug | info | warn | error
HEALTH_PORT=3000        # HTTP health-check port
RETRY_ATTEMPTS=3        # max retries per task
RETRY_DELAY_MS=1000     # initial back-off delay
```

## Project Structure

```
src/
  index.ts          # entry point
  robot.ts          # core Robot class
  scheduler.ts      # task scheduler
  logger.ts         # structured logger
  health.ts         # health-check HTTP server
  tasks/
    example.ts      # example built-in task
tests/
  robot.test.ts
  scheduler.test.ts
```

## Adding a Custom Task

```typescript
import { Task } from './src/robot';

const myTask: Task = {
  name: 'my-task',
  intervalMs: 5_000,
  async run(ctx) {
    ctx.log.info('Running my task');
    // your logic here
  },
};

robot.register(myTask);
```

## License

MIT
