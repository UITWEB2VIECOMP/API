const db = require('../../database')

exports.getOngoing = async (req, res) => {
    try {
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
      console.log(currentDate);
      const [contests] = await db.query(`SELECT t1.*, t2.corp_name
                                      FROM Contests AS t1
                                      JOIN Corporations AS t2
                                      ON t1.corporation_id = t2.corporation_id
                                      WHERE ? BETWEEN t1.start_date AND t1.end_date;
                                      `, [currentDate]);
      return res.status(200).json({ status: "success",
                                   data: contests[0]||[]  });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  };

exports.getUpcoming = async (req, res) => {
    try {
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
      const [contests] = await db.query(`SELECT t1.*, t2.corp_name
        FROM Contests AS t1
        JOIN Corporations AS t2
        ON t1.corporation_id = t2.corporation_id
        WHERE ? BETWEEN t1.start_date AND t1.end_date;
        `, [currentDate]);
      return res.status(200).json({ status: "success", data: contests[0]||[] });
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
      const [contest] = await db.query(`
        SELECT c.*, corp.corp_name
        FROM Contests AS c
        JOIN ContestParticipants AS cp ON c.contest_id = cp.contest_id
        JOIN Corporations AS corp ON c.corporation_id = corp.corporation_id
        WHERE cp.participant_id = ?`, 
        [participant[0].participant_id]
    );
    
      return res.status(200).json({ status: "success", data: contest[0]||[] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  }