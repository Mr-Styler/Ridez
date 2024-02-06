const dotenv = require('dotenv');
dotenv.config({ path: './../.env'})


const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (msg) => {
    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (err) {
        console.log(err);

         if (err.response) {
            console.error(err.response.body);
         }
    }
}

sendMail({
    to: "dregskylar@gmail.com",
    from: "fortraxempire@gmail.com",
    subject: "Hello !!!",
    text: "ConnectHub says Hello!!!"
})