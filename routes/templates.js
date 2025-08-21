const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

const allowedCategories = ['marketing', 'support', 'notification', 'welcome', 'other'];

function normalizeLanguage(value) {
  if (!value) return 'en';
  const v = String(value).toLowerCase();
  if (['en', 'english'].includes(v)) return 'en';
  if (['gu', 'gujarati', 'guj'].includes(v)) return 'gu';
  if (['hi', 'hindi'].includes(v)) return 'hi';
  return v; // let schema accept other codes if any
}

function normalizeCategory(value) {
  if (!value) return 'marketing';
  const v = String(value).toLowerCase();
  return allowedCategories.includes(v) ? v : 'other';
}

function normalizeVariables(variables) {
  if (!Array.isArray(variables)) return [];
  return variables
    .filter(v => v && (typeof v.name === 'string') && v.name.trim().length > 0)
    .map(v => ({
      name: String(v.name).trim(),
      description: typeof v.description === 'string' ? v.description.trim() : '',
      required: Boolean(v.required)
    }));
}

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single template
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new template
router.post('/', async (req, res) => {
  try {
    const name = (req.body.name || '').toString().trim();
    const content = (req.body.content || '').toString().trim();
    const category = normalizeCategory(req.body.category);
    const language = normalizeLanguage(req.body.language);
    const variables = normalizeVariables(req.body.variables);
    const status = (req.body.status || 'active').toString().toLowerCase();

    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }

    const template = new Template({ name, category, content, variables, language, status });
    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update template
router.put('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (req.body.name !== undefined) template.name = (req.body.name || template.name).toString().trim();
    if (req.body.category !== undefined) template.category = normalizeCategory(req.body.category);
    if (req.body.content !== undefined) template.content = (req.body.content || template.content).toString().trim();
    if (req.body.variables !== undefined) template.variables = normalizeVariables(req.body.variables);
    if (req.body.language !== undefined) template.language = normalizeLanguage(req.body.language);
    if (req.body.status !== undefined) template.status = (req.body.status || template.status).toString().toLowerCase();

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
