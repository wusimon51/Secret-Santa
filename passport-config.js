const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const controller = require('./controller/controller');

function initialize(passport, findUser) {
    console.log('initialize called');
    let user = undefined;
    const authenticateUser = async (username, password, done) => {
        findUser(username, (result) => {
            console.log('user in callback:', result);
            user = result;
        })
        console.log('user:', user);
        if (user === null) {
            return done(null, false);
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (e) {
            return done(e);
        }
    }
    passport.use(new LocalStrategy({}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null);
    });
}

module.exports = initialize;