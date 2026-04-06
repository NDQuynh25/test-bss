import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import redisConnection from '../config/redis-config.js';

const prisma = new PrismaClient();


const orderWorker = new Worker('flash-sale-orders', async (job) => {
    
    const { phone } = job.data;
    
    try {
        
        const order = await prisma.sale.create({
            data: { phone }
        });
        
        console.log(`Success save order: ${phone}`);
        return order;

    } catch (error) {
        console.error(`❌ Error save order: ${phone}:`, error);
        throw error; 
    }
}, {
    connection: redisConnection,
    concurrency: 10, 
});