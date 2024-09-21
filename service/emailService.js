const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chagatay.yildiz@code.edu.az',
        pass: 'vldw qyyc husx wvka'
    }
});


const sendEmail = async (email, confirmCode) => {
    const mailOptions = {
        from: 'chagatay.yildiz@code.edu.az',
        to: email,
        subject: 'Confirm Email',
        text: `Your confirm code: ${confirmCode}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendEmail
}