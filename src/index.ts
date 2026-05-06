import express from 'express';
import dotenv from 'dotenv';
import accountRoutes from './routes/account';
import paymentRoutes from './routes/payment';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/', accountRoutes);
app.use('/', paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`stellar-routex running on port ${PORT}`));

export default app;
