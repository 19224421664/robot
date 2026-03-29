import { Task } from '../robot';

/**
 * Example task — logs a heartbeat every 10 seconds.
 * Replace or extend this with your own automation logic.
 */
export const heartbeatTask: Task = {
  name: 'heartbeat',
  intervalMs: 10_000,

  async run(ctx) {
    ctx.log.info('💓 Heartbeat', { ts: new Date().toISOString() });

    // Respect abort signal in long-running loops:
    if (ctx.signal.aborted) return;

    // Simulate some async work
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, 500);
      ctx.signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new Error('Aborted'));
      }, { once: true });
    });

    ctx.log.info('Heartbeat complete');
  },
};
