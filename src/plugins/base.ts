import { Logger } from '../logger';

/**
 * Every plugin must implement this interface.
 */
export interface Plugin {
  /** Unique name used for logging and identification */
  readonly name: string;

  /**
   * Called once when the robot starts.
   * Use this for any async initialisation (DB connections, API auth, etc.)
   */
  init?(): Promise<void>;

  /**
   * Called on every scheduler tick for this plugin.
   */
  run(): Promise<void>;

  /**
   * Called once when the robot is shutting down.
   * Use this to close connections, flush buffers, etc.
   */
  teardown?(): Promise<void>;
}

/**
 * Convenience base class — provides a pre-wired logger and sensible no-op
 * implementations of the optional lifecycle hooks.
 */
export abstract class BasePlugin implements Plugin {
  abstract readonly name: string;

  protected readonly logger: Logger;

  constructor() {
    // logger is lazily wired; we use a getter so subclasses that set `name`
    // in their constructor body still get the correct context string.
    this.logger = new Logger('plugin');
  }

  // Subclasses can override; the base implementation is a no-op.
  async init(): Promise<void> {
    // override if needed
  }

  abstract run(): Promise<void>;

  async teardown(): Promise<void> {
    // override if needed
  }

  protected log(message: string, meta?: Record<string, unknown>): void {
    new Logger(`plugin:${this.name}`).info(message, meta);
  }
}
