import express from 'express';
import connectDB from './config/db.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'Tusker API running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});