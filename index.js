const express = require('express');
const mongoose = require('mongoose');
const WebUser = require('./models/webUser');
//cors
const cors = require('cors');
const { sendEmail } = require("./service/emailService");


const app = express();
app.use(cors());
const port =  process.env.PORT || 8080;

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

    //lowercase email

    req.body.email = req.body.email.toLowerCase();
    const { email } = req.body;

    // email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email" });
    }
    // kullanıcı kayıtlıysa kayıtlı email adresine email gönderilir ve confirmCode oluşturulur
    let user = await WebUser.findOne({ email });
    var confirmCode = Math.floor(1000 + Math.random() * 9000);

    if (!user) {
        user = await WebUser.create({ email, confirmCode });

        // email send
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
    console.log(req.body);


    //lowercase email
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


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});