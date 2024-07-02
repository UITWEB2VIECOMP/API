const express = require('express')
const mysql = require('mysql')
const dotenv = require('dotenv')
const app = express();

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use('/auth', require('./src/routes/auth'))

PORT = process.env.PORT| 5000
app.listen(PORT,()=>{
    console.log('Server is running...');
})