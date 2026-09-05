import express from 'express';
import Joi from 'joi';
import authMiddleware from '../middleware/auth.js';
import Campaign from '../models/Campaign.js';

const router = express.Router();

// Joi validation schema
const campaignSchema = Joi.object({
  name: Joi.string().required().trim(),
  emailTemplate: Joi.string().required(),
  csvFile: Joi.string().optional(),
  status: Joi.string().valid('draft', 'queued', 'sending', 'completed', 'failed').optional()
});

// POST /campaigns — create new campaign (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { error, value } = campaignSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, emailTemplate, csvFile, status } = value;

    const newCampaign = new Campaign({
      userId: req.user.userId,
      name,
      emailTemplate,
      csvFile: csvFile || '',
      status: status || 'draft',
      totalEmails: 0,
      sentEmails: 0
    });

    const campaign = await newCampaign.save();
    res.status(201).json({ message: 'Campaign created', campaign });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /campaigns — list all campaigns for logged-in user (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /campaigns/:id — get one campaign (protected, verify ownership)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this campaign' });
    }

    res.json({ campaign });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /campaigns/:id — update campaign (protected, verify ownership)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { error, value } = campaignSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this campaign' });
    }

    const { name, emailTemplate, csvFile, status } = value;

    if (name) campaign.name = name;
    if (emailTemplate) campaign.emailTemplate = emailTemplate;
    if (csvFile) campaign.csvFile = csvFile;
    if (status) campaign.status = status;

    const updatedCampaign = await campaign.save();
    res.json({ message: 'Campaign updated', campaign: updatedCampaign });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /campaigns/:id — delete campaign (protected, verify ownership)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this campaign' });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;