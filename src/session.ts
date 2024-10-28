import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function createSession(userId: number): Promise<string> {
  const sessionId = uuidv4();
  await redis.set(sessionId, userId.toString(), 'EX', 3600);
  return sessionId;
}