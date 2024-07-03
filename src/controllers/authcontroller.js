const db = require('../../database')
const bcrypt = require('bcrypt')
const mysql = require('mysql2')
const crypto = require('crypto');
const { Router } = require('express');
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
        const [insertParticipant] = await db.query('INSERT INTO Participants SET ?', { user_id: userID, first_name: firstname, last_name: lastname, dob: DOB });

        const [token] = await db.query('INSERT INTO tokens SET ',{user_id: userID, token: crypto.randomBytes(32).toString("hex")})

        const url = `${process.env.VERIFY_BASE_URL}users/${userID}/verify/${token[0].token}`
        await sendMail(email, "Verify email", url)

        return res.status(200).json({ status: "success",message: 'An email send to your account please verify' });
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}


exports.verify = async(req,res)=>{
    try{
        const {id, token } = req.params
        const [userCheck] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
        if(userCheck.length === 0){return res.status(400).json({status:"error",message:"Invalid link"})}
        const [tokenCheck] = await db.query('SELECT user_id, token FROM tokens WHERE user_id = ? AND token=?', [id, token])

        if(tokenCheck.length === 0){return res.status(400).json({status:"error",message:"Invalid link"})}

        await db.query('UPDATE users SET verified = TRUE WHERE user_id = ?',[id])
        await db.query('DELETE FROM tokens WHERE user_id = ?',[id])
        
        return res.status(200).json({status:"success", message:"email verified successfully"})
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
        const [emailCheck] = await db.query('SELECT email, password_hash ,user_id , role_id, verified FROM users WHERE email = ?', [email]);
        if(emailCheck.length === 0 || !await bcrypt.compare(password, emailCheck[0].password_hash)){
            return res.status(400).json({status: "error", message: "email or password is incorrect"}) 
        }
        if(!Number(emailCheck[0].verified)){
            const [token] = await db.query('SELECT token FROM tokens WHERE user_id = ? AND token=?', [id, token])
            if(tokenCheck.length === 0){    
                const url = `${process.env.VERIFY_BASE_URL}users/${userID}/verify/${token[0].token}`
                await sendMail(emailCheck[0].email, "Verify email", url)
                return res.status(400).json({status:"error",message:"An email is sent to your account please check"})
            }
        }
        let [role] = await db.query('SELECT role_name FROM roles WHERE role_id = ?', [emailCheck[0].role_id]);
        return res.status(200).send({status:'success', data:{user_id: emailCheck[0].user_id, role: role[0].role_name}})
        
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}