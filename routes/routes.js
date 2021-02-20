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
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    let santa = {};
    santa.name = req.body.name;
    santa.username = req.body.username;
    santa.password = req.body.password;
    controller.createUser(santa);

    res.redirect('/');
});

router.get('/', (req, res) => {
    res.render('index');
});

router.post('/', passport.authenticate('local', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect(`/user/${req.user.id}`);
    }
);

router.get('/user/:id', checkAuthenticated, async (req, res) => {
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

router.post('/user/:user_id/invite/:invite_id', checkAuthenticated, async (req, res) => {
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
            res.redirect(`/user/${req.params.user_id}`);
        })
    })
});

router.get('/create-event', checkAuthenticated, (req, res) => {
    res.render('create-event', {userId: req.user.id});
});

router.post('/create-event', checkAuthenticated, (req, res) => {
    const event = {};
    event.name = req.body.name;
    event.password = req.body.password;
    event.budget = req.body.budget;
    event.date = req.body.date;
    event.adminId = req.user.id;

    controller.createEvent(event, controller.addParticipant);
    res.redirect(`/user/${req.user.id}`);
});

router.get('/event/:id', checkAuthenticated, async (req, res) => {
    await controller.getParticipantsByEventId(req.params.id)
    .then((participants) => {
        let participant_ids = [];
        for (let participant of participants) {
            participant_ids.push({ id: participant.user_id, name: '' });
        }
        return [participant_ids, participants[0].event_name];
    })
    .then(async (eventDetails) => {
        for (let i = 0; i < eventDetails[0].length; i++) {
            await controller.queryUserById(eventDetails[0][i].id)
            .then((user) => {
                eventDetails[0][i].name = user.name;
            })
        }
        let adminId = undefined;
        let started = undefined;
        let date = undefined;
        let budget = undefined;
        await controller.getEventByEventId(req.params.id)
        .then((event) => {
            adminId = event.admin_id;
            started = event.started[0] === 1;
            date = event.date;
            budget = event.budget;
        })
        res.render('event', { participants: eventDetails[0], eventName: eventDetails[1], eventId: req.params.id, adminId: Number(adminId), currentUserId: req.user.id, started: started, date: date, budget: budget});
    })
});

router.post('/event/:id', checkAuthenticated, async (req, res) => {
    await controller.startEvent(req.params.id)
    .then(async (result) => {
        await controller.getParticipantsByEventId(req.params.id)
        .then(async (result) => {
            // Fisher-Yates shuffling
            for (let i = result.length - 1; i >= 1; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                let temp = result[j];
                result[j] = result[i];
                result[i] = temp;
            }
            for (let i = 0; i < result.length; i++) {
                if (i === result.length - 1) {
                    await controller.addRecipient(result[0].user_id, result[i].user_id, req.params.id);
                } else {
                    await controller.addRecipient(result[i + 1].user_id, result[i].user_id, req.params.id);
                }
            }
            res.redirect(`/event/${req.params.id}`);
        })
    })
});

router.get('/event/:event_id/invite', checkAuthenticated, (req, res) => {
    res.render('invite', { userId: req.user.id, eventId: req.params.event_id });
});

router.post('/event/:event_id/invite', checkAuthenticated, (req, res) => {
    const invite = {
        event_id: req.params.event_id,
        admin_id: req.user.id,
        username: req.body.username,
        message: req.body.message
    }
    controller.queryUserByUsername(invite.username).then((user) => {
        controller.createInvite(user.id, invite);
        res.redirect(`/event/${req.params.event_id}`);
    })
});

router.get('/event/:event_id/:user_id', checkAuthenticated, async (req, res) => {
    await controller.queryUserById(req.params.user_id)
    .then((user) => {
        return user.name;
    })
    .then(async (userName) => {
        await controller.getWishlist(req.params.user_id, req.params.event_id)
        .then(async (wishlist) => {
            if (req.user.id === Number(req.params.user_id)) {
                await controller.getRecipient(req.params.user_id, req.params.event_id)
                .then(async (recipient) => {
                    await controller.queryUserById(recipient.recipient_id)
                    .then((user) => {
                        const options = {
                            userName: userName,
                            items: wishlist,
                            eventId: req.params.event_id,
                            userId: Number(req.params.user_id),
                            currentUserId: req.user.id,
                            recipientId: recipient.recipient_id,
                            recipientName: user.name
                        };
                        res.render('event-user', options);
                    })
                })
            } else {
                const options = {
                    userName: userName,
                    items: wishlist,
                    eventId: req.params.event_id,
                    userId: Number(req.params.user_id),
                    currentUserId: req.user.id
                };
                res.render('event-user', options);
            }
        })
    })
});

router.post('/event/:event_id/:user_id', checkAuthenticated, async (req, res) => {
    const item = {
        user_id: req.params.user_id,
        name: req.body.name,
        price: req.body.price,
        event_id: req.params.event_id
    };
    await controller.addItem(item)
    .then((result) => {
        res.redirect(`/event/${req.params.event_id}/${req.params.user_id}`)
    });
});

router.delete('/event/:event_id/:user_id/:item_id/delete', checkAuthenticated, async (req, res) => {
    await controller.removeItem(req.params.item_id)
    .then((result) => {
        res.redirect(`/event/${req.params.event_id}/${req.params.user_id}`);
    })
})

router.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = router;