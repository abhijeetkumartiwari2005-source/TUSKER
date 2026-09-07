import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Campaign from '../models/Campaign.js';
import emailQueue from '../queues/emailQueue.js';

const router = express.Router();

router.post('/:campaignId/send', authMiddleware, async (req, res) => {
  try {
    const campaignId= req.params.CampaignId;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.userId.toString() !== req.user.userId) return res.status(403).json({ message: 'Unauthorized' });
    
    if (!campaign.csvFile || !campaign.emailTemplate) return res.status(400).json({ message: 'Missing CSV or template' });

    await emailQueue.add('send-email', {
    campaignId: campaign._id,
    emailTemplate: campaign.emailTemplate,
    totalEmails: campaign.totalEmails
        });

        campaign.status = 'queued';
        await campaign.save();

        res.json({ message: 'Campaign queued for sending' });

   
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;