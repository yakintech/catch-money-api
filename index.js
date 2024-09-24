const express = require('express');
const mongoose = require('mongoose');
const WebUser = require('./models/webUser');
const Income = require('./models/income');
const Expense = require('./models/expense');
const Category = require('./models/category');
//cors
const cors = require('cors');
const { sendEmail } = require("./service/emailService");

const app = express();
app.use(cors());
const port = process.env.PORT || 8080;

app.use(express.json());

mongoose.connect('mongodb+srv://techcareer_swift:qSJrSgUN9qfgs0Fa@cluster0.jcus0vv.mongodb.net/money-catcher-db').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post("/auth", async (req, res) => {
  req.body.email = req.body.email.toLowerCase();
  const { email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  let user = await WebUser.findOne({ email });
  var confirmCode = Math.floor(1000 + Math.random() * 9000);

  if (!user) {
    user = await WebUser.create({ email, confirmCode });
    sendEmail(email, confirmCode);
    return res.json({ id: user._id });
  } else {
    user.confirmCode = confirmCode;
    await user.save();
    sendEmail(email, confirmCode);
    return res.json({ id: user._id });
  }
});

app.post("/confirm", async (req, res) => {
  req.body.email = req.body.email.toLowerCase();
  const { email, confirmCode } = req.body;
  let user = await WebUser.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (user.confirmCode == confirmCode) {
    user.confirmed = true;
    await user.save();
    return res.json({ message: "Confirmed" });
  } else {
    return res.status(400).json({ message: "Invalid confirm code" });
  }
});

app.post("/checkuser", async (req, res) => {
  req.body.email = req.body.email.toLowerCase();
  const { email } = req.body;
  let user = await WebUser.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  if (user.confirmed) {
    return res.status(200).json({ message: "Confirmed" });
  }
  return res.status(400).json({ message: "Not confirmed" });
});

// Income endpoints
app.post('/income', async (req, res) => {
  try {
    const income = new Income(req.body);
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/income', async (req, res) => {
  try {
    const incomes = await Income.find();
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/income/:id', async (req, res) => {
  try {
    const income = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.status(200).json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/income/:id', async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.status(200).json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Expense endpoints
app.post('/expense', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/expense', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/expense/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/expense/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category endpoints
app.post('/category', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/category', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/category/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/category/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});