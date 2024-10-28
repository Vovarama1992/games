import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedUsers() {
  const users = [
    { username: 'user1', password: 'password123', balance: 100.0 },
    { username: 'user2', password: 'password456', balance: 200.0 },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, balance)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [user.username, passwordHash, user.balance]
    );
  }

  console.log('Пользователи успешно добавлены в базу данных');
  await pool.end();
}

seedUsers();