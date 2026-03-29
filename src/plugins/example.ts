import { BasePlugin } from './base';
import { Logger } from '../logger';

/**
 * ExamplePlugin — a minimal reference implementation.
 *
 * Replace (or supplement) this with your own plugins.
 */
export class ExamplePlugin extends BasePlugin {
  readonly name = 'example';

  private readonly log: Logger;
  private runCount = 0;

  constructor() {
    super();
    this.log = new Logger(`plugin:${this.name}`);
  }

  override async init(): Promise<void> {
    this.log.info('ExamplePlugin initialised');
  }

  async run(): Promise<void> {
    this.runCount += 1;
    this.log.info('ExamplePlugin tick', { runCount: this.runCount });

    // Simulate async work (e.g. an API call)
    await sleep(50);

    this.log.debug('ExamplePlugin work complete', { runCount: this.runCount });
  }

  override async teardown(): Promise<void> {
    this.log.info('ExamplePlugin teardown', { totalRuns: this.runCount });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
