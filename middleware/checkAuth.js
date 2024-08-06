const pool = require('../database')
const jsonWebToken = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()

exports.checkAuth= async(req, res, next)=>{
    const db  = await pool.getConnection()
    const token = req.headers['token'];
    if (!token) {
      return res.status(400).json({status: 'error', message: 'User is not login' });
    }
    try{
        const {user_id, role} = jsonWebToken.verify(token,process.env.JWTAUTHKEY)

        const [user] = await db.query('SELECT * FROM Users AS t1 JOIN Roles AS t2 ON t1.role_id = t2.role_id WHERE user_id = ? AND role_name = ?', [user_id, role])
        if (user.length === 0) {
            return res.status(404).json({status: 'error', message: 'User not found' });
        }
        req.headers.user_id = user_id
        req.headers.role = role
        next();
    }catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: "error", message: 'Token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ status: "error", message: 'Invalid token' });
        } else {
            console.error(error);
            return res.status(500).json({ status: "error", message: 'Internal server error' });
        }
    }finally{
        db.release()
    }
}