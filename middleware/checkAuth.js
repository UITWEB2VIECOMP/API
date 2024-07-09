const db = require('../database')

exports.checkAuth= async(req, res, next)=>{
    const userId = req.headers['user_id'];

    if (!userId) {
      return res.status(400).json({status: 'error', message: 'User is not login' });
    }
    try{
        const [user] = await db.query('SELECT * FROM Users WHERE user_id = ?', [userId])
        if (user.length === 0) {
            return res.status(404).json({status: 'error', message: 'User not found' });
        }
        next();
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}