const express = require('express');
const app = express();
require('dotenv').config();
const mysql = require('mysql');
const routes = require('./routes/routes');
const session = require('express-session');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'mydb'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('mysql connected!');
});

global.connection = connection;

app.set('view engine', 'ejs');
app.use(session({secret: 'secret'}))
app.use('/', routes);

app.listen(3000, () => {
    console.log('on port 3000')
});