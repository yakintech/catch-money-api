const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  note: { type: String }
}, { timestamps: true });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;