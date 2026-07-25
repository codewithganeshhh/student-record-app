const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  domain: { type: String, required: true },
  enquiry_date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Converted', 'Closed'] },
  notes: { type: String },
  created_at: { type: Date, default: Date.now }
});

enquirySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    converted.id = converted._id;
    delete converted._id;
    delete converted.__v;
  }
});

module.exports = mongoose.model('Enquiry', enquirySchema);
