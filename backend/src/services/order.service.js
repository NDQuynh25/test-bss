import { PrismaClient } from '@prisma/client';
import { normalizePhone, isValidPhone } from '../utils/phone.util.js';

const prisma = new PrismaClient();
const MAX_STOCK = 20;
const START_HOUR = 9;
const END_HOUR = 11;

export class OrderService {
  // Tách logic kiểm tra thời gian Flash Sale
  isFlashSaleTime() {
    const hour = new Date().getHours();
    return hour >= START_HOUR && hour < END_HOUR;
  }

  // Tách logic kiểm tra trạng thái chung (thời gian và số lượng)
  async getFlashSaleStatus() {
    if (!this.isFlashSaleTime()) {
      return { status: 'NO_PRODUCT' };
    }

    const soldCount = await prisma.sale.count();
    const remaining = MAX_STOCK - soldCount;

    return {
      status: 'AVAILABLE',
      product: { name: "Iphone 15", price: 1000 },
      remaining: remaining > 0 ? remaining : 0
    };
  }

 
  async createOrder(phone) {
    // 1. Kiểm tra thời gian
    if (!this.isFlashSaleTime()) {
      throw new Error(`Ngoài thời gian Flash Sale (${START_HOUR}h-${END_HOUR}h)`);
    }

    // 2. Kiểm tra số lượng
    const soldCount = await prisma.sale.count();
    if (soldCount >= MAX_STOCK) {
      throw new Error("Sản phẩm đã hết hàng!");
    }

    // 3. Chuẩn hóa và kiểm tra số điện thoại (nếu cần)
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      throw new Error("Số điện thoại không hợp lệ!");
    }

    // 4. Lưu đơn hàng vào DB (Prisma ném lỗi P2002 nếu trùng phone do Unique constraint)
    return await prisma.sale.create({
      data: { phone: normalizedPhone }
    });
  }
}
