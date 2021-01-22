const express = require('express');
const methodOverride = require('method-override');
const passport = require("passport");

const controller = require('../controller/controller');

const router = express.Router();

const initializePassport = require('../passport-config');

router.use(express.urlencoded({ extended: false }));
router.use(methodOverride('_method'));

initializePassport(passport,
    (username, callback) => {
        controller.queryUserByUsername(username).then((user) => callback(user))
    },
    (id, callback) => {
        controller.queryUserById(id).then((user) => callback(user))
    }
);

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
});

router.get('/santa/login', (req, res) => {
    res.render('login');
});

router.post('/santa/login', passport.authenticate('local', {
    successRedirect: '/santa',
    failureRedirect: '/santa/login'
}));

router.get('/santa/user/:id', checkAuthenticated, (req, res) => {
    res.send(`Hello user + ${req.params.id}`);
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/santa/login');
}

module.exports = router;