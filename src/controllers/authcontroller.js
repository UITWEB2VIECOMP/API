const db = require('../../database')
const bcrypt = require('bcrypt')
    
exports.register= async(req, res)=>{
    const {firstname, lastname,DOB, email, password, passwordConfirm} = req.body
    db.query('SELECT email FROM users where email = ?', [email], async(err, results)=>{
        if(err){
            console.log(err);
        }else if(results.length > 0){
            return res.status(400).json({message: 'email in use'})
        }else if(password !== passwordConfirm){
            return res.status(400).json({message: 'password do not match'})
        }
        try{
            let hashedPassword = await bcrypt.hash(password, 8);
            const roleID = db.query('SELECT role_id IN roles WHERE role_name = ?',['student'])
            db.query('INSERT INTO users SET ?',{email: email, password_hash: hashedPassword, role_id: roleID},(err, results)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log(results);
                    const userID = db.query('SELECT user_id IN users WHERE email = ?',[email])
                    db.query('INSERT INTO Participants SET ?',{user_id : userID, first_name: firstname, last_name: lastname, dob: DOB},(err, results)=>{
                        if(err){
                            console.log(err)
                        }else{
                            console.log(results);
                        }
                    })
                    return res.status(200).json({message: 'User Registerd'})
                    
                }
            })
        }catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    })
}