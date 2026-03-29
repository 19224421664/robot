import http from 'http';
import { Logger } from './logger';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  tasks: Record<string, 'running' | 'idle' | 'error'>;
}

export class HealthServer {
  private server: http.Server;
  private startTime = Date.now();
  private taskStatus: Record<string, 'running' | 'idle' | 'error'> = {};

  constructor(
    private readonly port: number,
    private readonly log: Logger,
  ) {
    this.server = http.createServer((req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        const body = this.buildStatus();
        res.writeHead(body.status === 'ok' ? 200 : 503, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(body));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
  }

  setTaskStatus(name: string, status: 'running' | 'idle' | 'error'): void {
    this.taskStatus[name] = status;
  }

  private buildStatus(): HealthStatus {
    const degraded = Object.values(this.taskStatus).some((s) => s === 'error');
    return {
      status: degraded ? 'degraded' : 'ok',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      tasks: { ...this.taskStatus },
    };
  }

  listen(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        this.log.info('Health server listening', { port: this.port });
        resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
