import { OrderService } from '../services/order.service.js';

class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  
  createOrder = async (req, res, next) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Số điện thoại không được bỏ trống" });
      }

      
      const result = await this.orderService.createOrder(phone);

      
      return res.status(202).json({
        status: "success",
        message: "Yêu cầu đặt hàng đang được xử lý, vui lòng chờ hệ thống xác nhận!",
        data: result
      });
      
    } catch (err) {
      
      if (err.message.includes("đã đặt hàng") || err.message.includes("hết hàng")) {
        return res.status(400).json({ message: err.message });
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

export const orderController = new OrderController();
