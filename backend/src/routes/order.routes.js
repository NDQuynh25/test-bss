import express from 'express';
import { orderController } from '../controllers/order.controller.js';

const router = express.Router();


router.get('/product-status', orderController.getProductStatus);


router.post('/order', orderController.createOrder);

export default router;
