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

router.get('/santa/user/:id', checkAuthenticated, async (req, res) => {
    await controller.getEventsByUserId(req.user.id)
    .then((result) => {
        let events = [];
        for (let event of result) {
            events.push({name: event.event_name, id: event.event_id});
        }
        return events;
    })
    .then((events) => {
        controller.getInvites(req.user.id).then((invites) => {
            res.render('user', { events: events, userId: req.user.id, invites: invites });
        });
    })
});

router.post('/santa/user/:user_id/invite/:invite_id', checkAuthenticated, async (req, res) => {
    await controller.getInviteByInviteId(req.params.invite_id)
    .then((invite) => {
        return parseInt(invite.event_id);
    })
    .then((eventId) => {
        controller.getEventByEventId(eventId)
        .then((event) => {
            return [event.id, event.name];
        })
        .then((info) => {
            controller.addParticipant(req.params.user_id, info[0], info[1]);
            controller.removeInvite(req.params.invite_id);
            res.redirect(`/santa/user/${req.params.user_id}`);
        })
    })
})

router.get('/santa/create-event', checkAuthenticated, (req, res) => {
    res.render('create-event');
});

router.post('/santa/create-event', checkAuthenticated, (req, res) => {
    const event = {};
    event.name = req.body.name;
    event.password = req.body.password;
    event.budget = req.body.budget;
    event.adminId = req.user.id;

    controller.createEvent(event, controller.addParticipant);
    res.redirect(`/santa/user/${req.user.id}`);
});

router.get('/santa/event/:id', checkAuthenticated, (req, res) => {
    res.render('event');
});

router.get('/santa/event/:event_id/invite', checkAuthenticated, (req, res) => {
    res.render('invite', { userId: req.user.id, eventId: req.params.event_id });
});

router.post('/santa/event/:event_id/invite', checkAuthenticated, (req, res) => {
    const invite = {
        event_id: req.params.event_id,
        admin_id: req.user.id,
        username: req.body.username,
        message: req.body.message
    }
    console.log(invite.username);
    console.log('message:', req.body.message);
    controller.queryUserByUsername(invite.username).then((user) => {
        controller.createInvite(user.id, invite);
        res.redirect(`/santa/event/${req.params.event_id}`);
    })
});

router.get('/santa/event/:event_id/:user_id', checkAuthenticated, (req, res) => {
    res.render('event-user', { userId: req.params.id });
});

router.post('/santa/event/:event_id/:user_id', checkAuthenticated, (req, res) => {

});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/santa/login');
}

module.exports = router;