const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()
module.exports = async(email, subject, content)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:process.env.VERIFY_HOST,
            service:process.env.VERIFY_SERVICE,
            port:Number(process.env.VERIFY_PORT),
            secure: Boolean(process.env.VERIFY_SERCURE),
            auth:{
                user:process.env.VERIFY_USER,
                pass:process.env.VERIFY_PASSWORD
            }
        })
        await transporter.sendMail({
            from: process.env.VERIFY_USER,
            to: email,
            subject: subject,
            text: content
        })
        console.log("Email send successfully");

    }catch(err){
        console.log("Email not send");
        console.log(err);
    }
}