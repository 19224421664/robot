import dotenv from 'dotenv';
dotenv.config();

import { Robot } from './robot';
import { heartbeatTask } from './tasks/example';

const logLevel = (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ?? 'info';
const healthPort = process.env.HEALTH_PORT ? parseInt(process.env.HEALTH_PORT, 10) : 3000;
const maxRetries = process.env.RETRY_MAX ? parseInt(process.env.RETRY_MAX, 10) : 3;
const retryDelay = process.env.RETRY_DELAY_MS ? parseInt(process.env.RETRY_DELAY_MS, 10) : 1000;

const robot = new Robot({
  logLevel,
  healthPort,
  maxRetries,
  retryDelay,
});

robot.schedule(heartbeatTask);
robot.start();
