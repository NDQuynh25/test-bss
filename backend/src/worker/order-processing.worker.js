// worker.js
import { Worker } from 'bullmq';
import redisConnection from './redis-config.js'; // Lưu ý thêm .js nếu là ESM

// Khởi tạo Worker lắng nghe Queue 'flash-sale-orders'
const orderWorker = new Worker(
  'flash-sale-orders',
  async (job) => {
    const { userId, productId, priceSnapshot } = job.data;

    console.log(`[Worker] Đang xử lý đơn hàng của User: ${userId}...`);

    try {
      

      // Trả về kết quả nếu thành công
      return { status: 'success', orderId: `ORD-${Date.now()}` };
    } catch (error) {
      
      console.error(`[Worker] Lỗi khi lưu DB cho User ${userId}:`, error.message);
      throw error;
    }
  },
  {
    connection: redisConnection,

    
    concurrency: 50, // Cho phép Worker xử lý đồng thời 50 đơn hàng cùng lúc

    limiter: {
      max: 200, // Giới hạn tốc độ: Xử lý TỐI ĐA 200 đơn hàng
      duration: 1000, // Trong vòng 1000ms (1 giây). Giúp bảo vệ DB không bị quá tải.
    },
  }
);

// Lắng nghe các sự kiện của Worker
orderWorker.on('completed', (job, returnvalue) => {
  console.log(`[Success] Job ${job.id} - Order ID: ${returnvalue.orderId}`);
});

orderWorker.on('failed', (job, err) => {
  console.log(
    `Error: ${err.message}`
  );
});