import { Router, Request, Response } from 'express';
import { Client } from 'pg';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<any> => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    const cachedItems = await redis.get('items');

    if (cachedItems) {
      const items = JSON.parse(cachedItems);
      if (items.length > 0) {
        return res.json(items);
      }
    }

    const result = await client.query(`
      SELECT name, tradable_price, non_tradable_price 
      FROM items
      WHERE tradable_price IS NOT NULL AND non_tradable_price IS NOT NULL
      ORDER BY tradable_price ASC, non_tradable_price ASC
      LIMIT 2
    `);

    const items = result.rows;
    await redis.set('items', JSON.stringify(items), 'EX', 60 * 60);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    await client.end();
  }
});

export default router;