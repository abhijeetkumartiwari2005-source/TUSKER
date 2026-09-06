import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import Campaign from '../models/Campaign.js';
import express from 'express';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const upload = multer({ dest: 'uploads' });

router.post('/:id/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "file not uploaded" });
    
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    
    if (campaign.userId.toString() !== req.user.userId) return res.status(403).json({ message: "unauthorized" });
    
    const emails = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        emails.push(row.email);
      })
      .on('end', async () => {
        campaign.csvFile = req.file.path;
        campaign.totalEmails = emails.length;
        await campaign.save();
        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'CSV uploaded', totalEmails: emails.length });
      });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;