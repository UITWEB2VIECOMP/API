const db = require('../../database')
const mysql = require('mysql2')
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')
const {getStorage, ref,uploadBytesResumable, getDownloadURL} =require('firebase/storage')
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

exports.uploadAvatar = async(req, res)=>{
    const {user_id} = req.headers
    try{
        const [user] = await db.query('SELECT * FROM Users WHERE user_id = ?',[user_id])
        if(user.length === 0){
            return res.status(400).json({status:'error',message: "user is not exist" })
        } 
        const file = {
            type: req.file.mimetype,
            buffer: req.file.buffer
        }
        const buildImage = await uploadImage(file,'avatar')
        await db.query('UPDATE Users SET avatar = ? WHERE user_id = ?',[buildImage, user_id])
        res.status(200).json({status:'success', message:"avatar is updated successfully"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}

exports.getUser = async(req, res)=>{
    try{
        const {user_id} = req.headers
        const [user] = await db.query('SELECT * FROM Users WHERE user_id = ?',[user_id])
        if(user.length === 0){
            return res.status(400).json({status:'error',message: "user is not exist" })
        } 
        const info = await db.query('SELECT t1.email, t1.avatar, t2.* FROM Users AS t1 JOIN Participants AS t2 ON t1.user_id = t2.user_id WHERE t1.user_id = ?',[user_id])
        return res.status(200).json({
            first_name: info[0][0].first_name,
            last_name: info[0][0].last_name,
            email: info[0][0].email,
            dob: info[0][0].dob,
            avatar: info[0][0].avatar,
            prizes: info[0][0].prizes||[]
        })
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: 'Internal server error' });
    }
}
exports.changePassword  = async(req, res)=>{
    const {user_id} = req.headers['user_id']
    const {old_password, new_password, c_new_password} = req.body   
    try{
        const [user] = db.query('SELECT * FROM Users WHERE user_id = ?',[user_id])
        if(user.length === 0){
            return res.status(400).json({status:'error',message: "user is not exist" })
        } 
        if(!await bcrypt.compare(old_password, user[0].password_hash)){
            return res.status(400).json({status:'error',message: "Password is incorrect" })
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
    }
}

