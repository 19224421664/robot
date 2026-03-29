# Robot 🤖

A lightweight, extensible automation robot framework built with TypeScript and Node.js.

## Features

- **Task scheduling** — run tasks on intervals or cron-like schedules
- **Plugin architecture** — add new capabilities via simple plugin modules
- **Structured logging** — JSON-formatted logs with configurable levels
- **Health check endpoint** — built-in HTTP server for monitoring
- **Graceful shutdown** — handles SIGTERM/SIGINT cleanly

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP health-check server port |
| `LOG_LEVEL` | `info` | Logging level (`debug`, `info`, `warn`, `error`) |
| `POLL_INTERVAL_MS` | `5000` | Default task poll interval in milliseconds |

### Running

```bash
# Development (with auto-reload)
npm run dev

# Production build
npm run build
npm start

# Tests
npm test
```

## Architecture

```
src/
├── index.ts          # Entry point — wires everything together
├── robot.ts          # Core Robot class
├── scheduler.ts      # Task scheduler
├── logger.ts         # Structured logger
├── server.ts         # HTTP health-check server
└── plugins/
    ├── base.ts       # Base plugin interface
    └── example.ts    # Example plugin
```

## Writing a Plugin

```typescript
import { BasePlugin } from './src/plugins/base';

export class MyPlugin extends BasePlugin {
  name = 'my-plugin';

  async run(): Promise<void> {
    this.logger.info('MyPlugin running');
    // your logic here
  }
}
```

Register it in `src/index.ts`:

```typescript
robot.register(new MyPlugin());
```

## License

MIT
