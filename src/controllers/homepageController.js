const db = require('../../database')

exports.getOngoing = async (req, res) => {
    try {
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); 
      console.log(currentDate);
      const [contests] = await db.query(`SELECT t1.*, t2.corp_name, t2.avatar
                                      FROM Contests AS t1
                                      JOIN (
                                          SELECT t3.*, t4.avatar 
                                          FROM Corporations AS t3
                                          JOIN Users AS t4
                                          ON t3.user_id = t4.user_id
                                      ) AS t2
                                      ON t1.corporation_id = t2.corporation_id
                                      WHERE ? BETWEEN t1.start_date AND t1.end_date;
                                      `, [currentDate]);
      return res.status(200).json({ status: "success",
                                   data: contests||[]  });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  };

  exports.getUpcoming = async (req, res) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        console.log('Current Date:', currentDate);
        const query = `
            SELECT t1.*, t2.corp_name, t2.avatar
            FROM Contests AS t1
            JOIN (
                SELECT t3.*, t4.avatar 
                FROM Corporations AS t3
                JOIN Users AS t4
                ON t3.user_id = t4.user_id
            ) AS t2
            ON t1.corporation_id = t2.corporation_id
            WHERE t1.start_date > ?;
        `;
        
        const [contests] = await db.query(query, [currentDate, currentDate]);
        console.log('Contests:', contests);
        return res.status(200).json({ status: "success", data: contests});
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
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const [contest] = await db.query(`
        SELECT c.*, corp.corp_name, u.avatar
        FROM Contests AS c
        JOIN ContestParticipants AS cp 
        ON c.contest_id = cp.contest_id
        JOIN Corporations AS corp 
        ON c.corporation_id = corp.corporation_id
        JOIN Users AS u ON corp.user_id = u.user_id
        WHERE cp.participant_id = ? AND ? BETWEEN c.start_date AND c.end_date`, 
        [participant[0].participant_id, currentDate]
    );
    
      return res.status(200).json({ status: "success", data: contest||[] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  }

  exports.getHomeInfo = async (req, res) => {
    try {
      const { user_id, role } = req.headers;
  
      if (role === 'student') {
        const [prizes] = await db.query('SELECT t2.prizes FROM Users AS t1 JOIN Participants AS t2 ON t1.user_id = t2.user_id WHERE t1.user_id = ?', [user_id]);
  
        const query = `SELECT AVG(grade) AS average, COUNT(participant_id) AS count
                       FROM ContestParticipants
                       WHERE participant_id IN (SELECT participant_id FROM Participants WHERE user_id = ?)`;
        const [info] = await db.query(query, [user_id]);
        console.log(prizes);
        const prizesCount = prizes[0].prizes? info[0].average : 0;
        const averageGrade = info[0].average ? info[0].average : 0;
        const participationCount = info[0].length ? info[0].count : 0;
  
        return res.status(200).json({
          status: "success",
          data: {
            prizes: prizesCount,
            avggrade: averageGrade,
            participated: participationCount
          }
        });
      } else {
        const has_hosted = await db.query("SELECT * FROM Contests WHERE corporation_id IN(SELECT corporation_id FROM Corporations WHERE user_id = ?)",[user_id])
        return res.status(200).json({ status: "success", data: {hosted:has_hosted[0].length } });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
  };
  