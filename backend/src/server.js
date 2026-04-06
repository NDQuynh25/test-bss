import express from 'express';
import cors from 'cors';

import orderRoutes from './routes/order.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', orderRoutes);

// Error handler
app.use(errorMiddleware);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});