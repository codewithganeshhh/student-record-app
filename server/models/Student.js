const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  domain: { type: String, required: true },
  joining_date: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, default: 'Active' },
  certificate: {
    certificateNo: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    issueDate: { type: Date }
  },
  created_at: { type: Date, default: Date.now }
});

// To match existing frontend which expects 'id' instead of '_id', 
// we transform the toJSON output
studentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    converted.id = converted._id;
    delete converted._id;
    delete converted.__v;
  }
});

module.exports = mongoose.model('Student', studentSchema);
