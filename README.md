# Robot 🤖

A lightweight TypeScript framework for building autonomous scheduled-task agents with structured logging, automatic retries, and a built-in health endpoint.

## Features

- **Task scheduling** — run tasks on fixed intervals
- **Structured logging** — JSON-formatted logs with configurable levels
- **Error recovery** — automatic retries with configurable limits
- **Health endpoint** — built-in HTTP health-check server

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

| Variable             | Default | Description                          |
|----------------------|---------|--------------------------------------|
| `LOG_LEVEL`          | `info`  | Log verbosity (`debug`, `info`, `warn`, `error`) |
| `HEALTH_PORT`        | `3000`  | Port for the health-check HTTP server |
| `RETRY_MAX_ATTEMPTS` | `3`     | Max retry attempts per failed task   |
| `RETRY_DELAY_MS`     | `1000`  | Delay between retries (ms)           |

These variables are loaded automatically at startup via `dotenv` and passed into the robot configuration.

## Usage

### Starting the robot

```bash
# Development (ts-node)
npm run dev

# Production (compiled)
npm run build
npm start
```

### Writing a custom task

```ts
import { Task } from "./scheduler";

const myTask: Task = {
  name: "my-task",
  intervalMs: 60_000,           // run every 60 seconds
  maxRetries: 3,                // optional, overrides default
  retryDelayMs: 500,            // optional, overrides default
  run: async (logger) => {
    logger.info("Running my task");
    // ... your logic here
  },
};

export default myTask;
```

Register the task in `src/index.ts`:

```ts
import myTask from "./tasks/my-task";

robot.schedule(myTask);
```

### Health endpoint

Once the robot is running, check its status:

```bash
curl http://localhost:3000/health
```

Example response:

```json
{
  "status": "ok",
  "uptime": 42,
  "tasks": {
    "heartbeat": "ok",
    "my-task": "ok"
  }
}
```

## Project structure

```
src/
  index.ts          # entrypoint — loads env, wires up Robot
  robot.ts          # core Robot class
  scheduler.ts      # task scheduler
  logger.ts         # structured logger
  health.ts         # health-check HTTP server
  tasks/
    example.ts      # example built-in task
.env.example        # sample environment variables
package.json
tsconfig.json
```

## Scripts

| Script        | Description                        |
|---------------|------------------------------------|
| `npm run dev` | Run with ts-node (development)     |
| `npm run build` | Compile TypeScript to `dist/`    |
| `npm start`   | Run compiled output                |
| `npm test`    | Run Jest test suite                |

## License

MIT
