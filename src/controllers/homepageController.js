const db = require('../../database')

exports.getOngoing = async (req, res) => {
    try {
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
      console.log(currentDate);
      const [contests] = await db.query('SELECT * FROM Contests WHERE ? BETWEEN start_date AND end_date', [currentDate]);
      return res.status(200).json({ status: "success", data: contests });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  };

exports.getUpcoming = async (req, res) => {
    try {
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
      const [contests] = await db.query('SELECT * FROM Contests WHERE start_date > ? ORDER BY start_date ASC', [currentDate]);
      return res.status(200).json({ status: "success", data: contests });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  };

  exports.getParticipating = async(req, res)=>{
    const {user_id} = req.headers
    try{
      const [participant] = await db.query('SELECT participant_id FROM Participants WHERE user_id = ?',[user_id])
      if (!participant.length) {
        return res.status(404).json({ status: "error", message: 'Participant not found' });
      }
      const [contest] = await db.query(`SELECT c.* 
                                      FROM Contests AS c
                                      JOIN ContestParticipants AS cp 
                                      ON c.contest_id = cp.contest_id
                                      WHERE cp.participant_id = ?`,[participant[0].participant_id])
      return res.status(200).json({ status: "success", contests: contest });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  }