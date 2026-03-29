import { Plugin } from './plugins/base';
import { Logger } from './logger';

export interface SchedulerOptions {
  /** How often (ms) each plugin's `run()` is called. Default: 5000 */
  intervalMs?: number;
}

interface PluginEntry {
  plugin: Plugin;
  timer: ReturnType<typeof setInterval> | null;
}

/**
 * Simple interval-based scheduler.
 *
 * Each registered plugin runs independently on its own interval so a slow
 * plugin cannot block others.
 */
export class Scheduler {
  private readonly entries: Map<string, PluginEntry> = new Map();
  private readonly intervalMs: number;
  private readonly logger: Logger;
  private running = false;

  constructor(options: SchedulerOptions = {}) {
    this.intervalMs = options.intervalMs ?? parseInt(process.env['POLL_INTERVAL_MS'] ?? '5000', 10);
    this.logger = new Logger('scheduler');
  }

  register(plugin: Plugin): void {
    if (this.entries.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    this.entries.set(plugin.name, { plugin, timer: null });
    this.logger.debug('Plugin registered', { plugin: plugin.name });
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    this.logger.info('Scheduler starting', {
      plugins: [...this.entries.keys()],
      intervalMs: this.intervalMs,
    });

    // Initialise all plugins concurrently
    await Promise.all(
      [...this.entries.values()].map(async ({ plugin }) => {
        try {
          await plugin.init?.();
          this.logger.info('Plugin initialised', { plugin: plugin.name });
        } catch (err) {
          this.logger.error('Plugin init failed', { plugin: plugin.name, err: String(err) });
        }
      }),
    );

    // Schedule each plugin
    for (const entry of this.entries.values()) {
      entry.timer = setInterval(() => {
        void this.runPlugin(entry.plugin);
      }, this.intervalMs);
    }

    this.logger.info('Scheduler started');
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    this.logger.info('Scheduler stopping');

    // Clear all timers
    for (const entry of this.entries.values()) {
      if (entry.timer !== null) {
        clearInterval(entry.timer);
        entry.timer = null;
      }
    }

    // Teardown all plugins concurrently
    await Promise.all(
      [...this.entries.values()].map(async ({ plugin }) => {
        try {
          await plugin.teardown?.();
          this.logger.info('Plugin torn down', { plugin: plugin.name });
        } catch (err) {
          this.logger.error('Plugin teardown failed', { plugin: plugin.name, err: String(err) });
        }
      }),
    );

    this.logger.info('Scheduler stopped');
  }

  private async runPlugin(plugin: Plugin): Promise<void> {
    const start = Date.now();
    try {
      await plugin.run();
      this.logger.debug('Plugin run complete', {
        plugin: plugin.name,
        durationMs: Date.now() - start,
      });
    } catch (err) {
      this.logger.error('Plugin run error', {
        plugin: plugin.name,
        err: String(err),
        durationMs: Date.now() - start,
      });
    }
  }

  get isRunning(): boolean {
    return this.running;
  }
}
