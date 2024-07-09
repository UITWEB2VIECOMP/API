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