import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import dotenv from 'dotenv';
import { createSession } from '../session';

dotenv.config();

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rowCount === 0) {
      await client.end();
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      await client.end();
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const sessionId = await createSession(user.id);
    res.json({ sessionId });
  } catch (error) {
    console.error('Ошибка при логине:', error);
    res.status(500).json({ error});
  } finally {
    await client.end();
  }
});

router.put('/change-password', async (req: Request, res: Response): Promise<any> => {
  const { username, oldPassword, newPassword } = req.body;
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rowCount === 0) {
      await client.end();
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
    
    if (!passwordMatch) {
      await client.end();
      return res.status(401).json({ error: 'Неверный старый пароль' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await client.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newPasswordHash, username]);
    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    await client.end();
  }
});

export default router;