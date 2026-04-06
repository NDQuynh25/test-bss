import { OrderService } from '../services/order.service.js';

class OrderController {
  constructor() {
    
    this.orderService = new OrderService();
  }

 
  createOrder = async (req, res, next) => {
    try {
      const { phone } = req.body;
      const result = await this.orderService.createOrder(phone);
      res.status(201).json({
        message: "Đặt hàng thành công!",
        data: null
      });
    } catch (err) {
      
      if (err.code === 'P2002') {
        return res.status(400).json({ message: "Số điện thoại này đã đặt hàng rồi!" });
      }
      next(err);
    }
  };

  getProductStatus = async (req, res, next) => {
    try {
      const status = await this.orderService.getFlashSaleStatus();
      res.json(status);
    } catch (err) {
      next(err);
    }
  };
}

// Xuất instance của controller ra cho router dùng
export const orderController = new OrderController();