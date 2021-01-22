const express = require('express');
const methodOverride = require('method-override');
const passport = require("passport");

const controller = require('../controller/controller');
const initializePassport = require('../passport-config');

const router = express.Router();

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

router.get('/', (req, res) => {
    res.redirect('/santa');
});

router.get('/santa', (req, res) => {
    res.render('index');
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

router.post('/santa/login', passport.authenticate('local', {failureRedirect: '/santa/login'}),
    (req, res) => {
        res.redirect(`/santa/user/${req.user.id}`);
    }
);

router.get('/santa/user/:id', checkAuthenticated, (req, res) => {
    res.render('user');
});

router.get('/santa/create-event', checkAuthenticated, (req, res) => {
    res.render('create-event');
});

router.post('/santa/create-event', checkAuthenticated, (req, res) => {
    const event = {};
    event.name = req.body.name;
    event.password = req.body.password;
    event.budget = req.body.budget;
    event.adminId = req.user.id;

    controller.createEvent(event);
    res.redirect(`/santa/user/${req.user.id}`);
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/santa/login');
}

module.exports = router;