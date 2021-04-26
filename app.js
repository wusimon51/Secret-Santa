const express = require('express');
const app = express();
require('dotenv').config();
const mysql = require('mysql');
const routes = require('./routes/routes');
const session = require('express-session');
const passport = require('passport');
const bodyparser = require('body-parser');
const methodOverride = require('method-override');

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DB_PASSWORD,
    database: 'db',
    port: 25060
});

connection.connect((err) => {
    if (err) throw err;
    console.log('mysql connected!');
});

global.connection = connection;

app.set('view engine', 'ejs');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(bodyparser.json());
app.use('/', routes);

app.listen(3000, () => {
    console.log('on port 3000')
});