const db = require('../../database')
const bcrypt = require('bcrypt')
const sendEmail = require('./sendEmail');
const mysql = require('mysql2')
const crypto = require('crypto');

exports.register = async(req, res)=>{
    const {firstname, lastname,DOB, email, password, passwordConfirm} = req.body
    try{
        const [check] = await db.query('SELECT email FROM users where email = ?', [email]);
        if(check.length > 0){
            return res.status(400).json({status: "error", message: 'email in use'})
        }else if(password !== passwordConfirm){
            return res.status(400).json({status: "error", message: 'password do not match'})
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        const [roles] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', ['student']);
        const roleID = roles[0].role_id;
        const [insertUser] = await db.query('INSERT INTO users SET ?', { email: email, password_hash: hashedPassword, role_id: roleID });
        const userID = insertUser.insertId;
        await db.query('INSERT INTO Participants SET ?', { user_id: userID, first_name: firstname, last_name: lastname, dob: DOB });

        const token_value = crypto.randomBytes(32).toString("hex")
        const expireDate = new Date(Date.now() + (60*60*1000));
        await db.query('INSERT INTO tokens SET ?',{user_id: userID, token: token_value,token_type: "emailverify", expires_at: expireDate })

        const url = `${process.env.VERIFY_BASE_URL}auth/${userID}/verify/${token_value}`
        await sendEmail(email, "Verify email", url)

        return res.status(200).json({ status: "success",message: 'An email send to your account please verify' });
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}


exports.verify = async(req,res)=>{
    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const {id, token } = req.params
        const [userCheck] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
        if(userCheck.length === 0){return res.status(400).json({status:"error",message:"Invalid link"})}
        const [tokenCheck] = await db.query('SELECT user_id, token FROM tokens WHERE user_id = ? AND token=? AND token_type = ?', [id, token, "emailverify"])

        if(tokenCheck.length === 0){return res.status(400).json({status:"error",message:"Invalid link or link is expired"})}

        await db.query('UPDATE users SET verified = TRUE WHERE user_id = ?',[id])
        await db.query('DELETE FROM tokens WHERE user_id = ? AND token_type = ?',[id, 'emailverify'])
        
        return res.status(200).json({status:"success", message:"email verified successfully"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}

exports.resend = async(req, res)=>{
    const { email } = req.body;
    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const [emailCheck] = await db.query('SELECT user_id,email, verified FROM users WHERE email = ?', [email]);

        if (emailCheck.length === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        if (emailCheck[0].verified) {
            return res.status(400).json({ status: "error", message: "Email is already verified" });
        }
        const [tokenCheck] = await db.query('SELECT token FROM tokens WHERE user_id = ? AND token_type = ?', [emailCheck[0].user_id, "emailverify"]);
        if (tokenCheck.length === 0) {
            const token_value = crypto.randomBytes(32).toString("hex")
            const expireDate = new Date(Date.now() + (60*60*1000));
            await db.query('INSERT INTO tokens SET ? ',{user_id: emailCheck[0].user_id, token: token_value,token_type: "emailverify", expires_at: expireDate})
            const url = `${process.env.VERIFY_BASE_URL}auth/${emailCheck[0].user_id}/verify/${token_value}`
            await sendEmail(emailCheck[0].email, "Verify email", url)
        }else{
            const url = `${process.env.VERIFY_BASE_URL}auth/${emailCheck[0].user_id}/verify/${tokenCheck[0].token}`;
            await sendEmail(email, "Verify email", url);
        }
        return res.status(200).json({ status: "success", message: "Verification email resented" });

    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}

exports.forgetpassword = async(req, res)=>{
    const {email} = req.body
    try{
        const [emailCheck] = await db.query('SELECT email, password_hash ,user_id , role_id, verified FROM users WHERE email = ?', [email]);
        if(emailCheck.length === 0){
            return res.status(400).json({status: "error", message: "email is not exist"}) 
        }
        const expireDate = new Date(Date.now() + (60*60*1000));
        const token = crypto.randomBytes(32).toString('hex');
        await db.query('INSERT INTO tokens SET ?',{user_id: emailCheck[0].user_id, token: token,token_type: "resetpassword", expires_at: expireDate })

        const url = `${process.env.VERIFY_BASE_URL}auth/${emailCheck[0].user_id}/verify/${token}`;
        await sendEmail(emailCheck[0].user_id, "Reset Password email",url)
        return res.status(200).json({status: success, msg:'reset password link is send to your mail'})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}

exports.login = async(req, res)=>{
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({status: "error", message: "Plese enter your email and password"})
    }
    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const [emailCheck] = await db.query('SELECT email, password_hash ,user_id , role_id, verified FROM users WHERE email = ?', [email]);
        if(emailCheck.length === 0 || !await bcrypt.compare(password, emailCheck[0].password_hash)){
            return res.status(400).json({status: "error", message: "email or password is incorrect"}) 
        }
        console.log(emailCheck[0].verified);
        if(!emailCheck[0].verified){
            return res.status(400).json({status:"error",message:"An email is sent to your account please check"})
        }
        let [role] = await db.query('SELECT role_name FROM roles WHERE role_id = ?', [emailCheck[0].role_id]);
        return res.status(200).json({status:'success', data:{user_id: emailCheck[0].user_id, role: role[0].role_name}})
        
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}