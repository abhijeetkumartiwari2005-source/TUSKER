import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { redisConfig, redisClient } from '../config/redis.js';
import Campaign from '../models/Campaign.js';

// Create Mailgun transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAILGUN_SMTP_HOST,
  port: process.env.MAILGUN_SMTP_PORT,
  secure: false,  // true for 465, false for 587
  auth: {
    user: process.env.MAILGUN_SMTP_USER,
    pass: process.env.MAILGUN_SMTP_PASS
  }
});

const worker = new Worker('email', async (job) => {
  console.log(`Processing job ${job.id}`);
  
  const { campaignId, emailTemplate } = job.data;
  
  // Fetch campaign to get emails
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  
  const emails = campaign.emails;
  const totalEmails = emails.length;
  
  for (let i = 0; i < totalEmails; i++) {
    try {
      // Send email via Mailgun
      await transporter.sendMail({
        from: process.env.MAILGUN_FROM_EMAIL,
        to: emails[i],
        subject: 'Your Campaign Email',
        html: emailTemplate
      });
      
      // Publish progress
      await redisClient.publish(
        `campaign:${campaignId}:progress`,
        JSON.stringify({
          campaignId,
          sent: i + 1,
          total: totalEmails,
          status: 'sending'
        })
      );
      
      console.log(`Email sent to ${emails[i]} (${i + 1}/${totalEmails})`);
      
    } catch (error) {
      console.error(`Failed to send to ${emails[i]}:`, error.message);
    }
  }
  
  return { success: true, sent: totalEmails };
}, { connection: redisConfig });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

console.log('Email worker started');