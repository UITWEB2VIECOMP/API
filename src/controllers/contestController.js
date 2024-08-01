const pool = require('../../database')
const dotenv = require('dotenv')
const {getStorage, ref,uploadBytesResumable, getDownloadURL, deleteObject} =require('firebase/storage')
const {signInWithEmailAndPassword} =require('firebase/auth')
const {auth} = require('../../config/firebase.config')
const { v4: uuid } = require('uuid');
dotenv.config()

const uploadImage = async(file, type)=>{
    const storageFB = getStorage()
    await signInWithEmailAndPassword(auth, process.env.FIREBASE_USER, process.env.FIREBASE_AUTH)
    const filename = `${type}/${uuid()}`
    const storageRef = ref(storageFB,filename)
    await uploadBytesResumable(storageRef, file.buffer,{contentType: file.type})
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

const deleteImage = async(furl, type, res)=>{
    try{
        const storageFB = getStorage()
        await signInWithEmailAndPassword(auth, process.env.FIREBASE_USER, process.env.FIREBASE_AUTH)
    
        const url = new URL(furl)
        const path = url.pathname;
        const spliturl = path.split('/').pop();
        const decodedFileName = decodeURIComponent(spliturl).split('/').pop();
        const filename = `${type}/${decodedFileName}`
        const storageRef = ref(storageFB,filename)
        await deleteObject(storageRef)
    }   catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}

exports.addContest =async(req, res)=>{
    const db = await pool.getConnection()
    try{
        const {user_id, role} = req.headers
        const {contest_name	, contest_description, start_date, end_date, prizes_description} = req.body
        let {questions} = req.body
        if(role != "corporation"){
            res.status(401).json({ status: "error", message: 'You not have permission to do this' })
        }
        if (!req.file || !contest_name || !start_date || !end_date || !prizes_description) {
            return res.status(401).json({ status: 'error', message: 'image, prize, name, date is required'});
        }
        if (!questions || !questions[0]) {
            return res.status(401).json({ status: 'error', message: 'question is required'});
        }
        const file = {
            type: req.file.mimetype,
            buffer: req.file.buffer
        }
        if(typeof(questions)==="string"){
            questions =JSON.parse(questions);
        }
        const [corporation_id] = await db.query("SELECT corporation_id FROM Corporations WHERE user_id = ?", [user_id])
        const query = `INSERT INTO Contests 
        (corporation_id, contest_name, contest_description, start_date, end_date, prizes_description,contest_image)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
        const buildImage = await uploadImage(file,'contestimg')
        const [contest] = await db.query(query, [corporation_id[0].corporation_id, contest_name, contest_description, start_date, end_date, prizes_description, buildImage])
        const contest_id = contest.insertId;
        for (let question of questions) {
            if (question.type === "multiple_choice") {
                await db.query(`
                    INSERT INTO ContestQuestions (contest_id, question_type_id, question_text, option_multiple_choice) 
                    VALUES (?, ?, ?, ?)
                `, [contest_id, 1, question.description, JSON.stringify(questions[0].form)]);
            } else if (question.type === "essay") {
                await db.query(`
                    INSERT INTO ContestQuestions (contest_id, question_type_id, question_text) 
                    VALUES (?, ?, ?)
                `, [contest_id, 2, question.description]);
            } else {
                await db.query(`
                    INSERT INTO ContestQuestions (contest_id, question_type_id, question_text) 
                    VALUES (?, ?, ?)
                `, [contest_id, 3, question.description]);
            }
        }

        return res.status(200).json({ status: 'success', message: 'Add contest successfully'});

    }catch(error){
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.getCorpManageInfo = async (req, res) => {
    const db = await pool.getConnection();
    const { user_id, role } = req.headers;
    try {
        if (role !== "corporation") {
            return res.status(401).json({ status: "error", message: 'You do not have permission to do this' });
        }

        const [corporationResults] = await db.query("SELECT corporation_id FROM Corporations WHERE user_id = ?", [user_id]);
        console.log(corporationResults);
        if (corporationResults.length === 0) {
            return res.status(404).json({ status: "error", message: 'Corporation not found' });
        }

        const corporation_id = corporationResults[0].corporation_id;

        const query = `
        SELECT 
            c.contest_id, 
            c.contest_name
        FROM Contests c
        WHERE c.corporation_id = ?
    `;

        const [results] = await db.query(query, [corporation_id]);
        const contests = [];
        for (const { contest_id, contest_name } of results) {
            let contest = contests.find(c => c.contest_id === contest_id);
            if (!contest) {
                contest = {
                    contestName: contest_name,
                    contest_id: contest_id,
                    submitted_participant: []
                };
                contests.push(contest);
            }
        
            const [participants] = await db.query(`
                SELECT t1.contest_participant_id, MAX(t2.submission_date) as latest_submission_date
                FROM ContestParticipants AS t1
                JOIN Submissions AS t2 ON t1.contest_participant_id = t2.contest_participant_id
                WHERE t1.submission_status = ? 
                AND t1.contest_id = ?
                GROUP BY t1.contest_participant_id
            `, ["submitted", contest_id]);
        
            console.log(`Participants for contest ${contest_id}:`, participants);
        
            contest.submitted_participant = participants;
        }
        return res.status(200).json({ status: "success", data: contests });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    } finally {
        db.release();
    }
};


exports.contestPage = async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params
    const {user_id, role}  = req.headers
    try{
        const [contest] = await db.query(`SELECT t1.*, t2.corp_name, t3.avatar FROM Contests AS t1
        JOIN Corporations AS t2 ON t1.corporation_id =  t2.corporation_id 
        JOIN Users AS t3 ON t2.user_id =  t3.user_id 
        WHERE contest_id = ?`, contest_id)
        const [addtion] = await db.query(`SELECT 
            COUNT(participant_id) AS total_participants,
            SUM(CASE WHEN submission_status = 'submitted' THEN 1 ELSE 0 END) AS submitted_participants
        FROM 
            ContestParticipants
        WHERE 
            contest_id = ?
        GROUP BY 
            contest_id`, [contest_id])
        const totalParticipants = addtion.length > 0 ? addtion[0].total_participants : 0;
        const submittedParticipants = addtion.length > 0 ? addtion[0].submitted_participants : 0;
        contest[0].total_participants = totalParticipants;
        contest[0].submitted_participants = submittedParticipants;
        if(role  === "corporation"){
            const [corporation] = await db.query("SELECT corporation_id FROM Corporations WHERE user_id = ?", [user_id])
            return res.status(200).json({status:"success", data: contest[0], hosted: corporation[0].corporation_id === contest[0].corporation_id})
        }else{
            const [participated] =await db.query(`SELECT contest_participant_id, t1.submission_status  
                FROM ContestParticipants AS t1
                JOIN Participants AS t2 ON t1.participant_id   =  t2.participant_id
                JOIN Users AS t3 ON t2.user_id =  t3.user_id 
                WHERE t1.contest_id = ? and t3. user_id =?`, [contest_id, user_id])
            return res.status(200).json({status:"success", data: contest[0] , 
                participated: participated.length !==0, submitted:participated[0].submission_status})
        }
    }catch(error){
        console.error(error);   
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}   

exports.changeContestName=async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params

    try{
        const {user_id, role} = req.headers
        const {contest_name} = req.body
        const [check] = await db.query(
            `SELECT contest_name FROM Contests AS t1
            JOIN Corporations AS t2 ON t1.corporation_id = t2.corporation_id 
            JOIN Users AS t3 ON t2.user_id = t3.user_id
            WHERE t1.contest_id = ? AND t3.user_id = ?`,
            [contest_id, user_id]
        );
        if (role !== "corporation" || check.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No permission' });
        }
        if(!contest_name){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET contest_name = ? WHERE contest_id = ?`,[contest_name, contest_id])

        return res.status(200).json({status: "success", message: "Name change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.changeContestDescription=async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params

    try{
        const {user_id, role} = req.headers
        const {contest_description} = req.body
        const [check] = await db.query(
            `SELECT contest_name FROM Contests AS t1
            JOIN Corporations AS t2 ON t1.corporation_id = t2.corporation_id 
            JOIN Users AS t3 ON t2.user_id = t3.user_id
            WHERE t1.contest_id = ? AND t3.user_id = ?`,
            [contest_id, user_id]
        );
        if (role !== "corporation" || check.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No permission' });
        }
        
        if(!contest_description){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET contest_description = ? WHERE contest_id = ?`,[contest_description, contest_id])

        return res.status(200).json({status: "success", message: "Description change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.changePrizeDescription=async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params
    try{
        const {user_id, role} = req.headers
        const {prizes_description} = req.body
        const [check] = await db.query(
            `SELECT contest_name FROM Contests AS t1
            JOIN Corporations AS t2 ON t1.corporation_id = t2.corporation_id 
            JOIN Users AS t3 ON t2.user_id = t3.user_id
            WHERE t1.contest_id = ? AND t3.user_id = ?`,
            [contest_id, user_id]
        );
        if (role !== "corporation" || check.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No permission' });
        }
        if(!prizes_description){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET prizes_description = ? WHERE contest_id = ?`,[prizes_description, contest_id])
        return res.status(200).json({status: "success", message: "Prize change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.changeContestImage=async(req, res)=>{
    const db = await pool.getConnection()
    const {user_id, role} = req.headers
    const {contest_id} = req.params
    try{
        const [check] = await db.query(
            `SELECT contest_name FROM Contests AS t1
            JOIN Corporations AS t2 ON t1.corporation_id = t2.corporation_id 
            JOIN Users AS t3 ON t2.user_id = t3.user_id
            WHERE t1.contest_id = ? AND t3.user_id = ?`,
            [contest_id, user_id]
        );
        if (role !== "corporation" || check.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No permission' });
        }
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file provided' });
        }
        const [contest] = await db.query('SELECT * FROM Contests WHERE contest_id = ?',[contest_id])
        if(contest[0].contest_image){
            await deleteImage(contest[0].contest_image,'contestimg')
        }
        const file = {
            type: req.file.mimetype,
            buffer: req.file.buffer
        }
        const buildImage = await uploadImage(file,'contestimg')
        await db.query('UPDATE Contests SET contest_image = ? WHERE contest_id = ?',[buildImage, contest_id])
        res.status(200).json({status:'success', message:"avatar is updated successfully"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.changeDate=async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params
    try{
        const {user_id, role} = req.headers
        const {start_date, end_date} = req.body
        const [check] = await db.query(
            `SELECT contest_name FROM Contests AS t1
            JOIN Corporations AS t2 ON t1.corporation_id = t2.corporation_id 
            JOIN Users AS t3 ON t2.user_id = t3.user_id
            WHERE t1.contest_id = ? AND t3.user_id = ?`,
            [contest_id, user_id]
        );
        if (role !== "corporation" || check.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No permission' });
        }
        if(!start_date || !end_date){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET start_date = ?,end_date = ? WHERE contest_id = ?`,[start_date, end_date, contest_id])
        return res.status(200).json({status: "success", message: "Date change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.deleteContest=async(req, res)=>{
    const db = await pool.getConnection()
    const {contest_id} = req.params
    try{
        const {user_id, role} = req.headers
        const [check] = await db.query(
            `SELECT contest_name FROM Contests AS t1
            JOIN Corporations AS t2 ON t1.corporation_id = t2.corporation_id 
            JOIN Users AS t3 ON t2.user_id = t3.user_id
            WHERE t1.contest_id = ? AND t3.user_id = ?`,
            [contest_id, user_id]
        );
        if (role !== "corporation" || check.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No permission' });
        }
        const image = await db.query(`SELECT contest_image FROM Contests WHERE contest_id = ?`, contest_id)
        await deleteImage(image[0].contest_image,'contestimg')
        await db.query(`DELETE FROM ContestQuestions WHERE contest_id = ?`,[contest_id])
        await db.query(`DELETE FROM Submissions WHERE contest_id = ?`,[contest_id])
        await db.query(`DELETE FROM ContestParticipants WHERE contest_id = ?`,[contest_id])
        await db.query(`DELETE FROM Contests WHERE contest_id = ?`,[contest_id])
        return res.status(200).json({status: "success", message: "Delete successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
