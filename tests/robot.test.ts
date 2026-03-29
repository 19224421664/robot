import { Robot } from '../src/robot';

describe('Robot', () => {
  it('should instantiate with default options', () => {
    const robot = new Robot({ healthPort: 0 });
    expect(robot).toBeDefined();
  });

  it('should schedule a task without throwing', () => {
    const robot = new Robot({ healthPort: 0 });
    expect(() => {
      robot.schedule({
        name: 'test-task',
        intervalMs: 60_000,
        run: async () => {},
      });
    }).not.toThrow();
  });
});
