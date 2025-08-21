const mongoose = require('mongoose');

const variableMappingSchema = new mongoose.Schema({
  variableName: { type: String, required: true, trim: true },
  type: { type: String, enum: ['field', 'static'], default: 'field' },
  value: { type: String, default: '' } // when type === 'field', value is a contact field name (e.g., 'name'); when 'static', literal text
}, { _id: false });

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Data' }],
  variableMappings: [variableMappingSchema],
  audienceFilters: {
    category: { type: String, enum: ['customer', 'lead', 'prospect', 'vendor', 'other', 'all'], default: 'all' },
    status: { type: String, enum: ['active', 'inactive', 'pending', 'all'], default: 'all' }
  },
  status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);


