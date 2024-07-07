const express = require('express')
const mysql = require('mysql2')
const dotenv = require('dotenv')
const app = express();
dotenv.config({path:'./.env'})
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use('/auth', require('./src/routes/auth'))
app.use('/api/users', require('./src/routes/users'))

const PORT = process.env.PORT|5000
console.log(PORT)
app.listen(PORT,()=>{
    console.log('Server is running...');
})