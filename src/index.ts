import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import purchaseRoutes from './routes/purchase';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/status', (req, res) => {
  res.send({ status: 'Server is running' });
});

app.use('/auth', authRoutes);
console.log('Auth routes mounted');

app.use('/items', itemRoutes);
console.log('Item routes mounted');

app.use('/purchase', purchaseRoutes);
console.log('Purchase routes mounted');

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});