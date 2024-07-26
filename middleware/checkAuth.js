const pool = require('../database')

exports.checkAuth= async(req, res, next)=>{
    const db  = await pool.getConnection()
    const userId = req.headers['user_id'];
    const role = req.headers['role'];
    console.log(userId, role);
    if (!userId || !role) {
      return res.status(400).json({status: 'error', message: 'User is not login' });
    }
    try{
        const [user] = await db.query('SELECT * FROM Users AS t1 JOIN Roles AS t2 ON t1.role_id = t2.role_id WHERE user_id = ? AND role_name = ?', [userId, role])
        if (user.length === 0) {
            return res.status(404).json({status: 'error', message: 'User not found' });
        }
        next();
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}