import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Campaign from '../models/Campaign.js';
import emailQueue from '../queues/emailQueues.js';
import { redisClient } from '../config/redis.js';

const router = express.Router();


  const DAILY_EMAIL_LIMIT = 10000;
  const RATE_LIMIT_KEY = (userId) => `rate-limit:${userId}:emails`;

router.post('/:campaignId/send', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const campaign = await Campaign.findById(campaignId);
    const userId=req.user.userId;

    // Check 1: does campaign exist?
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    // Check 2: does it belong to this user?
    if (campaign.userId.toString() !== req.user.userId) return res.status(403).json({ message: 'Unauthorized' });

    // Check 3: is it ready to send?
    if (!campaign.csvFile || !campaign.emailTemplate) return res.status(400).json({ message: 'Missing CSV or template' });

    // Add job to queue
    
    const key=RATE_LIMIT_KEY(userId);
    const currentCount=await redisClient.get(key);
    const emailCount=parseInt(currentCount||0);

    if (emailCount + campaign.totalEmails > DAILY_EMAIL_LIMIT) {
  return res.status(429).json({ message: 'Daily email limit exceeded' });
  }
  await emailQueue.add('send-email', {
      campaignId: campaign._id,
      emailTemplate: campaign.emailTemplate
    });
  await redisClient.incrBy(key, campaign.totalEmails);
  if(emailCount===0){await redisClient.expire(key,86400);}
    // Update campaign status
    campaign.status = 'queued';
    await campaign.save();

    res.json({ message: 'Emails have been sent to the queue' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;