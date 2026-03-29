/**
 * Structured JSON logger with configurable log levels.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  const raw = process.env['LOG_LEVEL'] ?? 'info';
  if (raw in LEVELS) return raw as LogLevel;
  return 'info';
}

export class Logger {
  private readonly context: string;
  private readonly minLevel: number;

  constructor(context: string, level?: LogLevel) {
    this.context = context;
    this.minLevel = LEVELS[level ?? getConfiguredLevel()];
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (LEVELS[level] < this.minLevel) return;

    const entry = {
      ts: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(meta ?? {}),
    };

    const line = JSON.stringify(entry);

    if (level === 'error' || level === 'warn') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.write('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.write('error', message, meta);
  }

  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

export const rootLogger = new Logger('robot');
