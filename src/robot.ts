import { Logger, logger as rootLogger } from './logger';
import { Scheduler, Task } from './scheduler';
import { HealthServer } from './health';

export type { Task } from './scheduler';
export type { TaskContext } from './scheduler';

export interface RobotOptions {
  name?: string;
  healthPort?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  logger?: Logger;
}

export class Robot {
  private readonly log: Logger;
  private readonly scheduler: Scheduler;
  private readonly health: HealthServer;
  private started = false;

  constructor(options: RobotOptions = {}) {
    this.log = (options.logger ?? rootLogger).child({ robot: options.name ?? 'robot' });

    this.health = new HealthServer(options.healthPort ?? 3000, this.log);

    this.scheduler = new Scheduler(this.log, {
      retryAttempts: options.retryAttempts ?? 3,
      retryDelayMs: options.retryDelayMs ?? 1_000,
      onStatusChange: (name, status) => this.health.setTaskStatus(name, status),
    });
  }

  /** Register a task to be run on its interval. */
  register(task: Task): this {
    this.scheduler.register(task);
    return this;
  }

  /** Start the robot: launch health server and begin scheduling tasks. */
  async start(): Promise<void> {
    if (this.started) throw new Error('Robot is already started');
    this.started = true;

    await this.health.listen();
    this.scheduler.start();

    this.log.info('Robot started');

    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
  }

  /** Gracefully stop all tasks and the health server. */
  async stop(): Promise<void> {
    await this.scheduler.stop();
    await this.health.close();
    this.log.info('Robot stopped');
  }

  private async shutdown(signal: string): Promise<void> {
    this.log.info('Shutdown signal received', { signal });
    await this.stop();
    process.exit(0);
  }
}
