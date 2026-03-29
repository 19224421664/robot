import { Logger, createLogger } from "./logger";
import { Scheduler, Task } from "./scheduler";
import { HealthServer } from "./health";

export interface RobotOptions {
  logLevel?: "debug" | "info" | "warn" | "error";
  healthPort?: number;
  defaultMaxRetries?: number;
  defaultRetryDelayMs?: number;
}

export class Robot {
  private logger: Logger;
  private scheduler: Scheduler;
  private health: HealthServer;

  constructor(options: RobotOptions = {}) {
    const {
      logLevel = "info",
      healthPort = 3000,
      defaultMaxRetries = 3,
      defaultRetryDelayMs = 1000,
    } = options;

    this.logger = createLogger({ level: logLevel, name: "robot" });

    this.scheduler = new Scheduler({
      logger: this.logger,
      defaultMaxRetries,
      defaultRetryDelayMs,
      onStatusChange: (taskName, status) => {
        this.health.setTaskStatus(taskName, status);
      },
    });

    this.health = new HealthServer({ port: healthPort, logger: this.logger });
  }

  schedule(task: Task): this {
    this.scheduler.add(task);
    return this;
  }

  start(): void {
    this.logger.info("Robot starting");
    this.health.start();
    this.scheduler.start();

    const shutdown = (signal: string) => {
      this.logger.info({ signal }, "Received signal, shutting down");
      this.scheduler.stop();
      this.health.stop();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }
}
