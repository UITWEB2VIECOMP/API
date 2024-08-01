const pool = require('../../database')
const {getStorage, ref,uploadBytesResumable, getDownloadURL, deleteObject} =require('firebase/storage')
const {signInWithEmailAndPassword} =require('firebase/auth')
const {auth} = require('../../config/firebase.config')
const { v4: uuid } = require('uuid');
const dotenv = require('dotenv')
dotenv.config()
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
        await db.query(`INSERT INTO ContestParticipants (contest_id, participant_id, submission_status) 
            VALUES (?, ?, ?, ?)`,[contest_id, participant[0].participant_id,'not submitted'])
        return res.status(200).json({ status: "success", message: 'join successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.getQuestions = async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params
    const {user_id, role} = req.headers
    try {
        if(role !== 'student'){
            return res.status(401).json({ status: "error", message: 'You have no permission' });
        }
        const [participant] = await db.query("SELECT participant_id FROM Participants WHERE user_id = ?",[user_id])
        const [check] = await db.query("SELECT submission_status FROM ContestParticipants WHERE participant_id = ? AND contest_id = ?",[participant[0].participant_id, contest_id])
        if(check.length === 0){
            return res.status(401).json({ status: "error", message: 'You havent join the contest' });
        }
        if(check[0].submission_status==="submitted"){
            return res.status(401).json({ status: "error", message: 'You submitted' });
        }
                
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [check2] = await db.query('SELECT * FROM Contests  WHERE contest_id = ? AND ? BETWEEN start_date AND end_date', [contest_id, currentDate])
        if(check2.length === 0){
            return res.status(401).json({ status: "error", message: 'Contest havenot started yet' });
        }
        const [questions] = await db.query(`SELECT t1.*, t2.type_name FROM ContestQuestions AS t1
            JOIN QuestionTypes AS t2 ON t1.question_type_id = t2.question_type_id
            WHERE contest_id = ?`,[contest_id])
        return res.status(200).json({ status: "success", data:questions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
} 
const uploadFiles = async(file, type) => {
    const storageFB = getStorage();
    await signInWithEmailAndPassword(auth, process.env.FIREBASE_USER, process.env.FIREBASE_AUTH);
    const filename = `${type}/${uuid()}`;
    const storageRef = ref(storageFB, filename);
    await uploadBytesResumable(storageRef, file.buffer, { contentType: file.mimetype });
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}
exports.submitContest = async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id, answers} = req.body
    const {user_id, role} = req.headers
    const jsAnswers = JSON.parse(answers)
    try {
        if(role !== 'student'){
            return res.status(401).json({ status: "error", message: 'You have no permission' });
        }
        const [participant] = await db.query("SELECT participant_id FROM Participants WHERE user_id = ?",[user_id])
        const [check] = await db.query("SELECT contest_participant_id FROM ContestParticipants WHERE participant_id = ? AND contest_id = ?",[participant[0].participant_id, contest_id])
        const contest_participant_id = check[0].contest_participant_id
        if(check.length === 0){
            return res.status(401).json({ status: "error", message: 'You havent join the contest' });
        }
        const [check2] = await db.query("SELECT submission_status FROM ContestParticipants WHERE participant_id = ? AND contest_id = ?",[participant[0].participant_id, contest_id])
        if(check2[0].submission_status==="submitted"){
            return res.status(401).json({ status: "error", message: 'You submitted' });
        }

        Object.entries(jsAnswers).forEach(async([key, data]) => {
            if (data.type === "file") {
                const file = req.files.find(file => file.fieldname === key)
                const fileUrl = await uploadFiles(file, "fileSubmission");
                await db.query(`INSERT INTO Submissions 
                    (contest_id, contest_participant_id, question_id, submission_type_id, file_path ) 
                    VALUES (?, ?, ?, ?, ?)`,[contest_id, contest_participant_id,key, 2, fileUrl])
            }else if(data.type === "multiple-choice"){
                await db.query(`INSERT INTO Submissions 
                    (contest_id, contest_participant_id, question_id, submission_type_id,multiple_choice_answer ) 
                    VALUES (?, ?, ?, ?, ?)`,[contest_id, contest_participant_id,key, 3, data.value])
            }else{
                await db.query(`INSERT INTO Submissions 
                    (contest_id, contest_participant_id, question_id, submission_type_id,submission_text) 
                    VALUES (?, ?, ?, ?, ?)`,[contest_id, contest_participant_id,key, 1, data.value])
            }
        });
        await db.query(`UPDATE ContestParticipants SET submission_status = ?
            WHERE contest_participant_id = ?`,["submitted",contest_participant_id])
        return res.status(200).json({ status: "success", message:"Submit successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.getSubmitted = async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id, contest_participant_id} = req.params
    const {user_id, role} = req.headers
    try {
        if(role !== 'corrporation'){
            return res.status(401).json({ status: "error", message: 'You have no permission' });
        }
        const [corporation] = await db.query("SELECT corporation_id FROM Corporations WHERE user_id = ?",[user_id])
        const [check] = await db.query("SELECT * FROM Contests WHERE corporation_id = ? AND contest_id = ?",[corporation[0].corporation_id, contest_id])
        if(check.length === 0){
            return res.status(401).json({ status: "error", message: 'You have no permission' });
        }
        const [submission] = await db.query(`SELECT t1.*, t2.* FROM ContestQuestions AS t1
            JOIN Submissions AS t2 ON t1.question_id = t2.question_id 
            WHERE t1.contest_id = ? AND t2.contest_participant_id = ?`)
        return res.status(200).json({ status: "success", data:submission});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.getParticipantContest = async(req, res)=>{
    const db = await pool.getConnection()
    const {user_id, role} = req.headers
    try {
        if(role !== 'student'){
            return res.status(401).json({ status: "error", message: 'You have no permission' });
        }
        const [participant] = await db.query("SELECT participant_id FROM Participants WHERE user_id = ?",[user_id])
        const [contest] = await db.query(`
            SELECT 
                t1.*, 
                t2.contest_name, 
                t2.start_date, 
                t2.end_date 
            FROM 
                ContestParticipants AS t1
            JOIN 
                Contests AS t2 
            ON 
                t1.contest_id = t2.contest_id
            WHERE 
                participant_id = ? 
            ORDER BY 
                CASE
                    WHEN t1.submission_status = 'not_submitted' THEN 1
                    ELSE 2
                END,
                CASE
                    WHEN NOW() BETWEEN t2.start_date AND t2.end_date THEN 1
                    WHEN NOW() < t2.start_date THEN 2
                    ELSE 3
                END,
                t2.start_date, 
                t2.end_date
        `, [participant[0].participant_id]);
        
        return res.status(200).json({ status: "success",data: contest});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}