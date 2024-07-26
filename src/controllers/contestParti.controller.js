const pool = require('../../database')
const dotenv = require('dotenv')

exports.joinContest = async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params
    try {
        const {user_id, role} = req.headers
        if(role === "corporation"){
            return res.status(401).json({ status: "error", message: 'You have no permission' });
        }
        const [participant] = await db.query("SELECT participant_id FROM Participants WHERE user_id = ?",[user_id])
        const [check] = await db.query("SELECT contest_participant_id FROM ContestParticipants WHERE participant_id = ? AND contest_id = ?",[participant[0].participant_id, contest_id])
        if(check.length !== 0){
            return res.status(401).json({ status: "error", message: 'You have already joined' });
        }
        await db.query(`INSERT INTO ContestParticipants (contest_id, participant_id, submission_status, grade) 
            VALUES (?, ?, ?, ?)`,[contest_id, participant[0].participant_id,'not submitted', 0])
        return res.status(200).json({ status: "success", message: 'join successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}