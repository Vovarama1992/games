import { Router, Request, Response } from 'express';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

router.post('/', async (req: Request, res: Response): Promise<any> => {
  const { username, itemName, price } = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    await client.query('BEGIN');

    const userResult = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rowCount === 0) {
      await client.end();
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const itemResult = await client.query('SELECT * FROM items WHERE name = $1', [itemName]);
    if (itemResult.rowCount === 0) {
      await client.end();
      return res.status(404).json({ error: 'Предмет не найден' });
    }

    const user = userResult.rows[0];
    const item = itemResult.rows[0];

    if (user.balance < price) {
      await client.end();
      return res.status(400).json({ error: 'Недостаточно средств' });
    }

    const newBalance = user.balance - price;
    await client.query('UPDATE users SET balance = $1 WHERE username = $2', [newBalance, username]);
    await client.query('INSERT INTO purchases (user_id, item_id, price) VALUES ($1, $2, $3)', [user.id, item.id, price]);

    await client.query('COMMIT');
    res.json({ message: 'Покупка успешна', newBalance });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    await client.end();
  }
});

export default router;