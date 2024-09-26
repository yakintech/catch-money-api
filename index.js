const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
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

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
app.post('/expense', upload.array('images', 10), async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      images: req.files ? req.files.map(file => file.path) : []
    };
    const expense = new Expense(expenseData);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/expense', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('category', 'name -_id').select('-__v');
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/expense/filter', async (req, res) => {
  try {
    const { period, category } = req.query;
    let filter = {};

    if (period !== 'all') {
      let startDate = new Date(); // Default to today
      startDate.setHours(0, 0, 0, 0);
      let endDate = new Date();

      switch (period) {
        case 'yesterday':
          startDate.setDate(startDate.getDate() - 1);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          filter.date = { $gte: startDate, $lte: endDate };
          break;
        case 'last_week':
          startDate.setDate(startDate.getDate() - 7);
          filter.date = { $gte: startDate };
          break;
        case 'last_month':
          startDate.setMonth(startDate.getMonth() - 1);
          filter.date = { $gte: startDate };
          break;
        case 'today':
        default:
          filter.date = { $gte: startDate };
          break;
      }
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter)
      .populate('category', 'name -_id')
      .select('-__v')
      .sort({ date: -1 }); // Sort by date in descending order

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
    const categories = await Category.find().select('_id name');
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