const express = require('express');
const path = require('path');
const methodOverride = require('method-override');

let controller = require('../controller/controller');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(methodOverride('_method'));

router.get('/santa', (req, res) => {
    res.send('This is the home page');
});

router.get('/santa/register', (req, res) => {
    res.render('register');
});

router.post('/santa/register', (req, res) => {
    let santa = {};
    santa.name = req.body.name;
    santa.username = req.body.username;
    santa.password = req.body.password;
    controller.createUser(santa);

    res.redirect('/santa/login');
})

router.get('/santa/login', (req, res) => {
    res.render('login');
})

router.post('/santa/login', controller.findUser, async (req, res) => {
    const{username, password} = req.body;
    console.log(req.rows);
    if (req.rows) {
        res.redirect('/santa');
    } else {
        res.redirect('/santa/login');
    }
})

module.exports = router;