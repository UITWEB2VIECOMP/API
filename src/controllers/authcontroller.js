const db = require('../../database')
const bcrypt = require('bcrypt')
const mysql = require('mysql2')

exports.register= async(req, res)=>{
    console.log('in reg');
    const {firstname, lastname,DOB, email, password, passwordConfirm} = req.body
    try{
        const [check] = await db.query('SELECT email FROM users where email = ?', [email]);
        if(check.length > 0){
            return res.status(400).json({message: 'email in use'})
        }else if(password !== passwordConfirm){
            return res.status(400).json({message: 'password do not match'})
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        const [roles] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', ['student']);
        const roleID = roles[0].role_id;
        const [insertUser] = await db.query('INSERT INTO users SET ?', { email: email, password_hash: hashedPassword, role_id: roleID });
        const userID = insertUser.insertId;
        const [insertParticipant] = await db.query('INSERT INTO Participants SET ?', { user_id: userID, first_name: firstname, last_name: lastname, dob: DOB });
        console.log(insertParticipant);
        return res.status(200).json({ message: 'User registered' });
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}