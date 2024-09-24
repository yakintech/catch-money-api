const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    note: { type: String },
    description: { type: String },
    images: [{ type: String }],
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;