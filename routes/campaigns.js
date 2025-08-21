const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Template = require('../models/Template');
const Data = require('../models/Data');

// List campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('template')
      .populate('recipients')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('template')
      .populate('recipients');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create campaign
router.post('/', async (req, res) => {
  try {
    const { name, templateId, recipientIds = [], variableMappings = [], audienceFilters = {}, scheduledAt } = req.body;

    const template = await Template.findById(templateId);
    if (!template) return res.status(400).json({ message: 'Invalid template' });

    // If audience filters provided but recipients empty, build recipients by filter
    let resolvedRecipients = recipientIds;
    if ((!recipientIds || recipientIds.length === 0) && audienceFilters) {
      const query = {};
      if (audienceFilters.category && audienceFilters.category !== 'all') query.category = audienceFilters.category;
      if (audienceFilters.status && audienceFilters.status !== 'all') query.status = audienceFilters.status;
      const matched = await Data.find(query).select('_id');
      resolvedRecipients = matched.map(c => c._id);
    }

    const campaign = new Campaign({
      name,
      template: template._id,
      recipients: resolvedRecipients,
      variableMappings,
      audienceFilters: {
        category: audienceFilters.category || 'all',
        status: audienceFilters.status || 'all'
      },
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    });

    const saved = await campaign.save();
    const populated = await Campaign.findById(saved._id)
      .populate('template')
      .populate('recipients');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const { name, templateId, recipientIds, variableMappings, audienceFilters, scheduledAt, status } = req.body;

    if (name) campaign.name = name;
    if (templateId) campaign.template = templateId;
    if (Array.isArray(recipientIds)) campaign.recipients = recipientIds;
    if (Array.isArray(variableMappings)) campaign.variableMappings = variableMappings;
    if (audienceFilters) campaign.audienceFilters = audienceFilters;
    if (scheduledAt !== undefined) campaign.scheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;
    if (status) campaign.status = status;

    const updated = await campaign.save();
    const populated = await Campaign.findById(updated._id)
      .populate('template')
      .populate('recipients');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


