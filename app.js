require('dotenv').config();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD
});

connection.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log('connected!')
    }
});