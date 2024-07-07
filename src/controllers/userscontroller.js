const db = require('../../database')
const mysql = require('mysql2')
const bcrypt = require('bcryptjs');

exports.getUser = async(req, res)=>{
    try{
        const {user_id} = req.headers['user_id']
        const [user] = db.query('SELECT * FROM Users WHERE user_id = ?',[user_id])
        if(user.length === 0){
            return res.status(400).json({status:'error',message: "user is not exist" })
        } 
        
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}
exports.changePassword  = async(req, res)=>{
    const {user_id} = req.headers['user_id']
    const {old_password, new_password, c_new_password} = req.body   
    try{
        const [user] = db.query('SELECT * FROM Users WHERE user_id = ?',[user_id])
        if(user.length === 0){
            return res.status(400).json({status:'error',message: "user is not exist" })
        } 
        if(!await bcrypt.compare(old_password, user[0].password_hash)){
            return res.status(400).json({status:'error',message: "Password is incorrect" })
        }
        if(new_password != c_new_password){
            return res.status(401).json({status: 'error', message:"Confirm password is not match!"})
        }
        const hashedPassword = await bcrypt.hash(new_password, 8);
        await db.query("UPDATE Users SET password_hash = ? WHERE user_id = ?",[hashedPassword, user_id])
        
        return res.status(200).json({status: "success", message: "Password change successfully!"})

    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}