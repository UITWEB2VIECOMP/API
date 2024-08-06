const pool = require('../../database')
const bcrypt = require('bcrypt')
const sendEmail = require('./sendEmail');
const mysql = require('mysql2')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

exports.register = async(req, res)=>{
    const {firstname, lastname,DOB, email, password, passwordConfirm} = req.body
    const db = await pool.getConnection()
    try{
        const [check] = await db.query('SELECT email FROM Users where email = ?', [email]);
        if(check.length > 0){
            return res.status(400).json({status: "error", message: 'email in use'})
        }else if(password !== passwordConfirm){
            return res.status(400).json({status: "error", message: 'password do not match'})
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        const [Roles] = await db.query('SELECT role_id FROM Roles WHERE role_name = ?', ['student']);
        const roleID = Roles[0].role_id;
        const [insertUser] = await db.query('INSERT INTO Users SET ?', { email: email, password_hash: hashedPassword, role_id: roleID });
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
    }finally{
        db.release()
    }
}

exports.registerCorp = async(req, res)=>{
    const {corp_name,address,contact_info, email, password, passwordConfirm} = req.body
    const db = await pool.getConnection()

    try{
        const [check] = await db.query('SELECT email FROM Users where email = ?', [email]);
        if(check.length > 0){
            return res.status(400).json({status: "error", message: 'email in use'})
        }else if(password !== passwordConfirm){
            return res.status(400).json({status: "error", message: 'password do not match'})
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        const [Roles] = await db.query('SELECT role_id FROM Roles WHERE role_name = ?', ['corporation']);
        const roleID = Roles[0].role_id;
        const [insertUser] = await db.query('INSERT INTO Users SET ?', { email: email, password_hash: hashedPassword, role_id: roleID });
        const userID = insertUser.insertId;
        await db.query('INSERT INTO Corporations SET ?', { user_id: userID, corp_name: corp_name, address: address, contact_info: contact_info });

        const token_value = crypto.randomBytes(32).toString("hex")
        const expireDate = new Date(Date.now() + (60*60*1000));
        await db.query('INSERT INTO tokens SET ?',{user_id: userID, token: token_value,token_type: "emailverify", expires_at: expireDate })

        const url = `${process.env.VERIFY_BASE_URL}auth/${userID}/verify/${token_value}`
        await sendEmail(email, "Verify email", url)
        return res.status(200).json({ status: "success",message: 'An email send to your account please verify' });
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}



exports.verify = async(req,res)=>{
    const db = await pool.getConnection()

    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const {id, token } = req.params
        const [userCheck] = await db.query('SELECT user_id FROM Users WHERE user_id = ?', [id]);
        if(userCheck.length === 0){return res.status(400).json({status:"error",message:"Invalid link"})}
        const [tokenCheck] = await db.query('SELECT user_id, token FROM tokens WHERE user_id = ? AND token=? AND token_type = ?', [id, token, "emailverify"])

        if(tokenCheck.length === 0){return res.status(400).json({status:"error",message:"Invalid link or link is expired"})}

        await db.query('UPDATE Users SET verified = TRUE WHERE user_id = ?',[id])
        await db.query('DELETE FROM tokens WHERE user_id = ? AND token_type = ?',[id, 'emailverify'])
        
        return res.status(200).json({status:"success", message:"email verified successfully"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.resend = async(req, res)=>{
    const { email } = req.body;
    const db = await pool.getConnection()

    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const [emailCheck] = await db.query('SELECT user_id,email, verified FROM Users WHERE email = ?', [email]);

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
    }finally{
        db.release()
    }
}

exports.forgetpassword = async(req, res)=>{
    const {email} = req.body
    const db = await pool.getConnection()

    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const [emailCheck] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if(emailCheck.length === 0){
            return res.status(400).json({status: "error", message: "email is not exist"}) 
        }
        const expireDate = new Date(Date.now() + (60*60*1000));
        const [tokenCheck] = await db.query('SELECT token FROM tokens WHERE user_id = ? AND token_type = ?', [emailCheck[0].user_id, "resetpassword"]);
        var url = ''
        
        if(tokenCheck.length !== 0){
            await db.query('DELETE FROM tokens WHERE user_id = ? AND token_type = ? ', [emailCheck[0].user_id,"resetpassword"]);
        }
        const token = crypto.randomBytes(32).toString('hex');
        await db.query('INSERT INTO tokens SET ?',{user_id: emailCheck[0].user_id, token: token,token_type: "resetpassword", expires_at: expireDate }) 
        url = `${process.env.VERIFY_BASE_URL}auth/${emailCheck[0].user_id}/resetpassword/${token}`;        
        await sendEmail(emailCheck[0].email, "Reset Password email",url)
        return res.status(200).json({status: "success", msg:'reset password link is send to your mail'})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.resetpassword_check = async(req, res)=>{
    const {id, token } = req.params
    const db = await pool.getConnection()

    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const [checkID] = await db.query('SELECT * FROM Users WHERE user_id = ?', [id]);
        if (checkID.length === 0) {
            return res.status(400).json({ status: "error", message: "User is not found" });
        }

        const [checkToken] = await db.query('SELECT * FROM tokens WHERE user_id = ? AND token = ? AND token_type = ?', [id, token, "resetpassword"]);
        if (checkToken.length === 0) {
            return res.status(400).json({ status: "error", message: "Link is invalid or expired" });
        }
        
        return res.status(200).json({status:"success", 
                                    message:"Link is valid", 
                                    data:{id: id, token: token}})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.resetpassword = async(req, res)=>{
    const db = await pool.getConnection()

    try{
        const {id, token} = req.params
        const {new_password, c_new_password} = req.body
        console.log(new_password);
        console.log(c_new_password);
        if(new_password != c_new_password){
            return res.status(400).json({status: 'error', message:"Confirm password is not match!"})
        }
        const [oldPassword] = await db.query('SELECT * FROM Users WHERE user_id = ?', [id]);
        if (oldPassword.length === 0) {
            return res.status(400).json({ status: 'error', message: 'User not found' });
        }
        console.log(oldPassword[0]);
        const match = await bcrypt.compare(new_password, oldPassword[0].password_hash);
        if (match) {
            return res.status(400).json({ status: 'error', message: 'New password should be different from the old password' });
        }
        
        const hashedPassword = await bcrypt.hash(new_password, 8);
        await db.query("UPDATE Users SET password_hash = ? WHERE user_id = ?",[hashedPassword, id])

        await db.query('DELETE FROM tokens WHERE user_id = ? AND token = ? AND token_type = ?',[id,token, 'resetpassword'])
        
        res.status(200).json({status: "success", message: "Password change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.login = async(req, res)=>{
    const db = await pool.getConnection()
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({status: "error", message: "Plese enter your email and password"})
    }
    try{
        await db.query('DELETE FROM tokens WHERE expires_at < ?', [new Date()]);
        const [emailCheck] = await db.query('SELECT email, password_hash ,user_id , role_id, verified FROM Users WHERE email = ?', [email]);
        if(emailCheck.length === 0 || !await bcrypt.compare(password, emailCheck[0].password_hash)){
            return res.status(400).json({status: "error", message: "email or password is incorrect"}) 
        }
        console.log(emailCheck[0].verified);
        if(!emailCheck[0].verified){
            return res.status(400).json({status:"error",message:"An email is sent to your account please check"})
        }
        let [role] = await db.query('SELECT role_name FROM Roles WHERE role_id = ?', [emailCheck[0].role_id]);
        const payload = {
            user_id: emailCheck[0].user_id,
            role: role[0].role_name,
        };
        const token = jwt.sign(payload, process.env.JWTAUTHKEY, { expiresIn: process.env.JWTEXPIREDAYS });

        return res.status(200).json({ status: 'success', data: {role: role[0].role_name  , token: token } });
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }finally{
        db.release()
    }
}