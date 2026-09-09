import { Worker } from 'bullmq';
import { redisConfig, redisClient } from '../config/redis.js';
import nodemailer from 'nodemailer';
import Campaign from '../models/Campaign.js';

const worker = new Worker('email', async (job) => {
  console.log(`Processing job ${job.id}`);
  

  const { campaignId, emailTemplate, totalEmails } = job.data;
  
  for (let i = 0; i < totalEmails; i++) {
    await redisClient.publish(
      `campaign:${campaignId}:progress`,
      JSON.stringify({
        campaignId,
        sent: 1+i,
        totalEmails,
       
        status: 'sending'
      })
    );
    
    // Simulate email sending (will replace with Nodemailer later)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Return job result
  return { success: true, sent: totalEmails };
}, { connection: redisConfig });

// Handle successful jobs
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

// Handle failed jobs
worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

console.log('Email worker started');