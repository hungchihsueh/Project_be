const express = require('express');
const router = express.Router();
const mailer = require('nodemailer');
const con = require('../utilities/db');
require('dotenv').config();
const { loginCheckMiddleware } = require('../Middlewares/Auth');

router.use(loginCheckMiddleware);

router.get("/", async (req, res) => {
    res.send("havelogin");
})

router.post("/", async (req, res) => {
    let result = ""
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const charactersLength = characters.length
    for (let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }   
    console.log(req.body);
    const data = req.body;
    let response = await con.queryAsync("INSERT INTO giftcard (user_id, code, usable_email) VALUES (?, ?, ?)", [1, result, data.giftEmail])
    
    let mailTransport = mailer.createTransport({
        service: 'gmail',        
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PWD,
        }
    });
    mailTransport.sendMail(
        {
            from: data.name,
            to: `${data.giftName} <${data.giftEmail}>`,
            subject: 'P&B禮物卡',
            html: `<h1>致: ${data.giftName}</h1><pre>${data.giftMessage}</pre><p>附上禮物碼: ${result}</p><h3>寄件人: ${data.name}</h3>`
        },
        function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("success");
                res.send("success")
            }
        }
    )
    
})


module.exports = router