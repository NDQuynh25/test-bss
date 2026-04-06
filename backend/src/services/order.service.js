import { PrismaClient } from '@prisma/client';
import { normalizePhone, isValidPhone } from '../utils/phone.util.js';
import { Queue } from 'bullmq'; // Thêm BullMQ
import redisConnection from '../configs/redis-config.js'; 

const prisma = new PrismaClient();
const MAX_STOCK = 20;
const START_HOUR = 9;
const END_HOUR = 11;
const REDIS_KEY = 'flash_sale:iphone15:count';


export const orderQueue = new Queue('flash-sale-orders', { 
    connection: redisConnection 
});

export class OrderService {
  
  
  isFlashSaleTime() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(START_HOUR, 0, 0, 0);
    const end = new Date(now);
    end.setHours(END_HOUR, 0, 0, 0);
    
    return now >= start && now < end;
  }

  
  async getFlashSaleStatus() {
    if (!this.isFlashSaleTime()) {
      return { status: 'NO_PRODUCT' };
    }

    
    const count = await redisConnection.get(REDIS_KEY) || 0;
    const remaining = MAX_STOCK - parseInt(count);

    return {
      status: 'AVAILABLE',
      product: { name: "Iphone 15", price: 1000 },
      remaining: remaining > 0 ? remaining : 0
    };
  }

  
  async createOrder(phone) {
    if (!this.isFlashSaleTime()) {
      throw new Error(`Ngoài thời gian Flash Sale (${START_HOUR}h-${END_HOUR}h)`);
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      throw new Error("Số điện thoại không hợp lệ!");
    }

    // Each phone number is a key to store the lock in Redis.
    const USER_LOCK_KEY = `flash_sale:iphone15:bought:${normalizedPhone}`;
    
    const isFirstTime = await redisConnection.setnx(USER_LOCK_KEY, "1");
    
    if (isFirstTime === 0) {
      throw new Error("Số điện thoại này đã đặt hàng hoặc đang trong hàng đợi xử lý!");
    }

    await redisConnection.expire(USER_LOCK_KEY, 86400);

   
    const currentCount = await redisConnection.incr(REDIS_KEY);
    
    if (currentCount > MAX_STOCK) {
      await redisConnection.decr(REDIS_KEY);
      
      // delete lock key because stock is out
      await redisConnection.del(USER_LOCK_KEY); 
      
      throw new Error("Sản phẩm đã hết hàng!");
    }

    
    await orderQueue.add('process-order', { phone: normalizedPhone }, {
        removeOnComplete: true, 
        attempts: 3, 
        backoff: { type: 'exponential', delay: 1000 }
    });

    return true;
  }
}
