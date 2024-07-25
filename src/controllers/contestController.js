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

        if (corporationResults.length === 0) {
            return res.status(404).json({ status: "error", message: 'Corporation not found' });
        }

        const corporation_id = corporationResults[0].corporation_id;

        const query = `
            SELECT 
                c.contest_id, 
                c.contest_name,
                cp.contest_participant_id
            FROM Contests c
            LEFT JOIN ContestParticipants cp ON c.contest_id = cp.contest_id
            WHERE c.corporation_id = ? AND (cp.submission_status = 'submitted' OR cp.submission_status IS NULL)
        `;

        const [results] = await db.query(query, [corporation_id]);

        const contests = [];
        results.forEach(({ contest_id, contest_name, contest_participant_id }) => {
            let contest = contests.find(c => c.contest_id === contest_id);
            if (!contest) {
                contest = {
                    contestName: contest_name,
                    contest_id: contest_id,
                    submitted_participant: []
                };
                contests.push(contest);
            }
            if (contest_participant_id) {
                contest.submitted_participant.push({
                    contest_participant_ID: contest_participant_id
                });
            }
        });

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
        const totalParticipants = addtion.length > 0 ? rows[0].total_participants : 0;
        const submittedParticipants = addtion.length > 0 ? rows[0].submitted_participants : 0;
        contest[0].total_participants = totalParticipants;
        contest[0].submitted_participants = submittedParticipants;
        if(role  === "corporation"){
            return res.status(200).json({status:"success", data: contest[0]})
        }else{
            const [participated] =await db.query(`SELECT contest_participant_id  
                FROM ContestParticipants AS t1
                JOIN Participants AS t2 ON t1.participant_id   =  t2.participant_id
                JOIN Users AS t3 ON t2.user_id =  t3.user_id 
                WHERE t1.contest_id = ? and t3. user_id =?`, [contest_id, user_id])
            return res.status(200).json({status:"success", data: contest[0] , participated: participated.length !==0})
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

    try{
        const {user_id, role} = req.headers
        const {contest_name} = req.body
        if(!contest_name){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET contest_name = ? WHERE corporation_id 
            IN (SELECT corporation_id IN Corporations WHERE user_id = ?)`,[contest_name, user_id])
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

    try{
        const {user_id, role} = req.headers
        const {contest_description} = req.body
        if(!contest_description){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET contest_description = ? WHERE corporation_id 
            IN (SELECT corporation_id IN Corporations WHERE user_id = ?)`,[contest_description, user_id])
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

    try{
        const {user_id, role} = req.headers
        const {prizes_description} = req.body
        if(!prizes_description){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET prizes_description = ? WHERE corporation_id 
            IN (SELECT corporation_id IN Corporations WHERE user_id = ?)`,[prizes_description, user_id])
        return res.status(200).json({status: "success", message: "Address change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.changeContestImage=async(req, res)=>{
    const db = await pool.getConnection()

    try{
        const {user_id, role} = req.headers
        const {prizes_description} = req.body
        if(!prizes_description){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query(`UPDATE Contests SET prizes_description = ? WHERE corporation_id 
            IN (SELECT corporation_id IN Corporations WHERE user_id = ?)`,[prizes_description, user_id])
        return res.status(200).json({status: "success", message: "Address change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}