import axios from 'axios';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function loadItems() {
  try {
    const response = await axios.get('https://api.skinport.com/v1/items');
    const items = response.data;

    for (const item of items) {
      if (item.market_hash_name) {
        await pool.query(
          `INSERT INTO items (item_id, name, tradable_price, non_tradable_price)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (item_id) DO NOTHING`,
          [
            item.market_hash_name,
            item.market_hash_name,
            item.min_price,
            item.suggested_price
          ]
        );
      } else {
        console.warn(`Пропуск предмета с отсутствующим market_hash_name:`, item);
      }
    }

    console.log('Данные успешно загружены в базу данных');
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    await pool.end();
  }
}

loadItems();