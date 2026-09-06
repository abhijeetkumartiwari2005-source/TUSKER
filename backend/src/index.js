import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import csvUploadRoutes from './routes/csvUpload.js';


const app = express();



const PORT = process.env.PORT || 5000;

app.use(express.json());
connectDB();

app.use('/auth', authRoutes);

app.use('/campaigns', campaignRoutes);

app.use('/campaigns', csvUploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Tusker API running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});