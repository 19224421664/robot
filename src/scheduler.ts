import { Logger } from './logger';

export interface TaskContext {
  log: Logger;
  signal: AbortSignal;
}

export interface Task {
  /** Unique task name */
  name: string;
  /** How often to run in milliseconds */
  intervalMs: number;
  /** The work to perform */
  run(ctx: TaskContext): Promise<void>;
}

interface ScheduledTask {
  task: Task;
  timer: ReturnType<typeof setTimeout> | null;
  running: boolean;
  errorCount: number;
}

export interface SchedulerOptions {
  retryAttempts?: number;
  retryDelayMs?: number;
  onStatusChange?: (name: string, status: 'running' | 'idle' | 'error') => void;
}

export class Scheduler {
  private tasks = new Map<string, ScheduledTask>();
  private abortController = new AbortController();

  constructor(
    private readonly log: Logger,
    private readonly options: SchedulerOptions = {},
  ) {}

  register(task: Task): void {
    if (this.tasks.has(task.name)) {
      throw new Error(`Task "${task.name}" is already registered`);
    }
    this.tasks.set(task.name, {
      task,
      timer: null,
      running: false,
      errorCount: 0,
    });
    this.log.info('Task registered', { task: task.name, intervalMs: task.intervalMs });
  }

  start(): void {
    for (const entry of this.tasks.values()) {
      this.schedule(entry);
    }
    this.log.info('Scheduler started', { taskCount: this.tasks.size });
  }

  async stop(): Promise<void> {
    this.abortController.abort();
    for (const entry of this.tasks.values()) {
      if (entry.timer !== null) {
        clearTimeout(entry.timer);
        entry.timer = null;
      }
    }
    // Wait briefly for any in-flight runs to detect the abort signal
    await new Promise((r) => setTimeout(r, 50));
    this.log.info('Scheduler stopped');
  }

  private schedule(entry: ScheduledTask): void {
    entry.timer = setTimeout(() => this.run(entry), entry.task.intervalMs);
  }

  private async run(entry: ScheduledTask): Promise<void> {
    if (this.abortController.signal.aborted) return;

    entry.running = true;
    this.options.onStatusChange?.(entry.task.name, 'running');

    const ctx: TaskContext = {
      log: this.log.child({ task: entry.task.name }),
      signal: this.abortController.signal,
    };

    const maxAttempts = this.options.retryAttempts ?? 3;
    const baseDelay = this.options.retryDelayMs ?? 1_000;

    let attempt = 0;
    let succeeded = false;

    while (attempt < maxAttempts && !this.abortController.signal.aborted) {
      attempt++;
      try {
        await entry.task.run(ctx);
        entry.errorCount = 0;
        succeeded = true;
        break;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.log.warn('Task attempt failed', {
          task: entry.task.name,
          attempt,
          maxAttempts,
          error: message,
        });

        if (attempt < maxAttempts && !this.abortController.signal.aborted) {
          const delay = baseDelay * 2 ** (attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    if (!succeeded) {
      entry.errorCount++;
      this.log.error('Task failed after all attempts', {
        task: entry.task.name,
        errorCount: entry.errorCount,
      });
      this.options.onStatusChange?.(entry.task.name, 'error');
    } else {
      this.options.onStatusChange?.(entry.task.name, 'idle');
    }

    entry.running = false;

    // Reschedule unless shutting down
    if (!this.abortController.signal.aborted) {
      this.schedule(entry);
    }
  }
}
