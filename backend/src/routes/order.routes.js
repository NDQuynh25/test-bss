import express from 'express';
import { orderController } from '../controllers/order.controller.js';

const router = express.Router();

// Lấy thông tin trạng thái Flash Sale
router.get('/product-status', orderController.getProductStatus);

// Đặt hàng
router.post('/order', orderController.createOrder);

export default router;
