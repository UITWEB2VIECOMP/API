const pool = require('../../database')
const mysql = require('mysql2')
const bcrypt = require('bcrypt');
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

exports.changeName= async(req, res)=>{
    const {user_id, role} = req.headers
    const db = await pool.getConnection()

    try{
        if(role==="student"){
            const {first_name , last_name} = req.body
            if(!first_name || !last_name){
                return res.status(400).json({ status: 'error', message: 'Missing value provided' });
            }
            console.log(first_name, last_name);
            await db.query("UPDATE Participants SET first_name = ?, last_name=? WHERE user_id = ?",[first_name, last_name, user_id])
            return res.status(200).json({status: "success", message: "Name change successfully!"})
        }else{
            const {corp_name} = req.body
            await db.query("UPDATE Corporations SET corp_name = ? WHERE user_id = ?",[corp_name, user_id])
            return res.status(200).json({status: "success", message: "Name change successfully!"})
        }
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.changeDOB= async(req, res)=>{
    const db = await pool.getConnection()

    try{
        const {user_id, role} = req.headers
        const {DOB} = req.body
        if(!DOB){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query("UPDATE Participants SET dob = ? WHERE user_id = ?",[DOB, user_id])
        return res.status(200).json({status: "success", message: "DOB change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.changeAddress= async(req, res)=>{
    const db = await pool.getConnection()

    try{
        const {user_id, role} = req.headers
        const {address} = req.body
        if(!address){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query("UPDATE Corporations SET address = ? WHERE user_id = ?",[address, user_id])
        return res.status(200).json({status: "success", message: "Address change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.changeDescription= async(req, res)=>{
    const db = await pool.getConnection()

    try{
        const {user_id, role} = req.headers
        const {description} = req.body
        if(!description){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query("UPDATE Corporations SET description = ? WHERE user_id = ?",[description, user_id])
        return res.status(200).json({status: "success", message: "description change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.changeContactInfo =  async(req, res)=>{
    const db = await pool.getConnection()

    try{
        const {user_id, role} = req.headers
        const {contact_info} = req.body
        if(!contact_info){
            return res.status(400).json({ status: 'error', message: 'Missing value provided' });
        }
        await db.query("UPDATE Corporations SET contact_info = ? WHERE user_id = ?",[contact_info, user_id])
        return res.status(200).json({status: "success", message: "contact info change successfully!"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}


exports.uploadAvatar = async(req, res)=>{
    const {user_id} = req.headers
    const db = await pool.getConnection()
    try{
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file provided' });
        }
        const file = {
            type: req.file.mimetype,
            buffer: req.file.buffer
        }
        const [user] = await db.query('SELECT * FROM Users WHERE user_id = ?',[user_id])
        if(user[0].avatar !== 'https://firebasestorage.googleapis.com/v0/b/viecontest-e4a3c.appspot.com/o/avatar%2F76336a09-ca5d-4fbb-a294-d44e4cc54999?alt=media&token=4713c098-e832-4224-8657-d296bc658171'){
            await deleteImage(user[0].avatar,'avatar')
        }
        const buildImage = await uploadImage(file,'avatar')
        await db.query('UPDATE Users SET avatar = ? WHERE user_id = ?',[buildImage, user_id])
        res.status(200).json({status:'success', message:"avatar is updated successfully"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}

exports.getUser = async(req, res)=>{
    const db = await pool.getConnection()
    try{
        const {user_id, role} = req.headers
        if(!role){
            return res.status(400).json({status: "error", message: 'No role found' });
        }
        if(role === "student"){
            const info = await db.query('SELECT t1.email, t1.avatar, t1.created_at, t2.* FROM Users AS t1 JOIN Participants AS t2 ON t1.user_id = t2.user_id WHERE t1.user_id = ?',[user_id])
            const has_participated = await db.query("SELECT * FROM ContestParticipants WHERE participant_id IN(SELECT participant_id FROM Participants WHERE user_id = ?)",[user_id])
            return res.status(200).json({
                first_name: info[0][0].first_name,
                last_name: info[0][0].last_name,
                email: info[0][0].email,
                dob: info[0][0].dob,
                avatar: info[0][0].avatar,
                created_at: info[0][0].created_at,
                prizes: info[0][0].prizes||[],
                has_participated: has_participated[0].length
            })
        }else{
            const info = await db.query('SELECT t1.email, t1.avatar,t1.created_at, t2.* FROM Users AS t1 JOIN Corporations AS t2 ON t1.user_id = t2.user_id WHERE t1.user_id = ?',[user_id])
            const has_hosted = await db.query("SELECT * FROM Contests WHERE corporation_id IN(SELECT corporation_id FROM Corporations WHERE user_id = ?)",[user_id])
            return res.status(200).json({
                corp_name: info[0][0].corp_name,
                email: info[0][0].email,
                address: info[0][0].address,
                contact_info: info[0][0].contact_info,
                created_at: info[0][0].created_at,
                description: info[0][0].description || [],
                avatar: info[0][0].avatar,
                has_hosted:has_hosted[0].length
            })
        }
        

    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}
exports.changePassword  = async(req, res)=>{
    const {user_id} = req.headers
    const {old_password, new_password, c_new_password} = req.body   
    const db = await pool.getConnection()
    try{
        const [user] = await db.query('SELECT * FROM Users WHERE user_id = ?',[user_id])
        if(!await bcrypt.compare(old_password, user[0].password_hash)){
            return res.status(400).json({status:'error',message: "Password is incorrect" })
        }
        if (new_password===old_password) {
            return res.status(400).json({ status: 'error', message: 'New password should be different from the old password' });
        }
        if(new_password != c_new_password){
            return res.status(401).json({status: 'error', message:"Confirm password is not match!"})
        }
        const hashedPassword = await bcrypt.hash(new_password, 8);
        await db.query("UPDATE Users SET password_hash = ? WHERE user_id = ?",[hashedPassword, user_id])
        
        return res.status(200).json({status: "success", message: "Password change successfully!"})

    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }finally{
        db.release()
    }
}


