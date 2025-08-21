const express = require('express');
const router = express.Router();
const Data = require('../models/Data');

// Get all data entries
router.get('/', async (req, res) => {
  try {
    const data = await Data.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single data entry
router.get('/:id', async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Data entry not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new data entry
router.post('/', async (req, res) => {
  const data = new Data({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    category: req.body.category || 'customer',
    status: req.body.status || 'active',
    tags: req.body.tags || [],
    notes: req.body.notes
  });

  try {
    const newData = await data.save();
    res.status(201).json(newData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk import data entries
router.post('/bulk-import', async (req, res) => {
  try {
    const { contacts } = req.body;
    
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ message: 'Contacts array is required and must not be empty' });
    }

    const validContacts = contacts.filter(contact => 
      contact.name && contact.phone && 
      contact.name.trim().length > 0 && 
      contact.phone.trim().length > 0
    );

    if (validContacts.length === 0) {
      return res.status(400).json({ message: 'No valid contacts found in the import data' });
    }

    const importedContacts = [];
    const errors = [];

    for (let i = 0; i < validContacts.length; i++) {
      try {
        const contact = new Data({
          name: validContacts[i].name.trim(),
          phone: validContacts[i].phone.trim(),
          email: validContacts[i].email || '',
          category: validContacts[i].category || 'customer',
          status: validContacts[i].status || 'active',
          tags: validContacts[i].tags || [],
          notes: validContacts[i].notes || `Imported from Excel on ${new Date().toLocaleDateString()}`
        });

        const savedContact = await contact.save();
        importedContacts.push(savedContact);
      } catch (error) {
        errors.push({
          index: i,
          contact: validContacts[i],
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `Successfully imported ${importedContacts.length} contacts`,
      imported: importedContacts.length,
      total: validContacts.length,
      errors: errors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update data entry
router.put('/:id', async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Data entry not found' });
    }

    data.name = req.body.name || data.name;
    data.phone = req.body.phone || data.phone;
    data.email = req.body.email || data.email;
    data.category = req.body.category || data.category;
    data.status = req.body.status || data.status;
    data.tags = req.body.tags || data.tags;
    data.notes = req.body.notes || data.notes;

    const updatedData = await data.save();
    res.json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete data entry
router.delete('/:id', async (req, res) => {
  try {
    const data = await Data.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Data entry not found' });
    }

    res.json({ message: 'Data entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
