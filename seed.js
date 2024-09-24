const mongoose = require('mongoose');
const Category = require('./models/category');
const Expense = require('./models/expense');

const categories = [
  { name: 'Food' },
  { name: 'Drink' },
  { name: 'Transport' },
  { name: 'Entertainment' },
  { name: 'Utilities' },
  { name: 'Healthcare' },
  { name: 'Education' },
  { name: 'Miscellaneous' }
];

const expenses = [
  { amount: 15, date: new Date(), category: 'Food', description: 'Pizza' },
  { amount: 5, date: new Date(), category: 'Drink', description: 'Coffee' },
  { amount: 2.5, date: new Date(), category: 'Transport', description: 'Paris Bus Ticket' },
  { amount: 50, date: new Date(), category: 'Entertainment', description: 'Movie Ticket' },
  { amount: 100, date: new Date(), category: 'Utilities', description: 'Electricity Bill' },
  { amount: 30, date: new Date(), category: 'Healthcare', description: 'Medicine' },
  { amount: 200, date: new Date(), category: 'Education', description: 'Online Course' }
];

mongoose.connect('mongodb+srv://techcareer_swift:qSJrSgUN9qfgs0Fa@cluster0.jcus0vv.mongodb.net/money-catcher-db').then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    await Category.deleteMany(); // Mevcut kategorileri temizle
    const insertedCategories = await Category.insertMany(categories); // Yeni kategorileri ekle
    console.log('Categories have been seeded');

    // Kategorileri mapleyerek ObjectId'leri al
    const categoryMap = insertedCategories.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    }, {});

    // Expense verilerini güncelle
    const updatedExpenses = expenses.map(expense => ({
      ...expense,
      category: categoryMap[expense.category]
    }));

    await Expense.deleteMany(); // Mevcut harcamaları temizle
    await Expense.insertMany(updatedExpenses); // Yeni harcamaları ekle
    console.log('Expenses have been seeded');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});