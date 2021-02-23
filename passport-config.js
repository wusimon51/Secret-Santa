const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => {
        await getUserByUsername(username, async (result) => {
            const user = result;
            if (user === null) {
                return done(null, false, { message: 'Your username or password is incorrect' });
            }

            // check password
            try {
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Your username or password is incorrect' });
                }
            } catch (e) {
                return done(null, false);
            }
        })
    }
    passport.use(new LocalStrategy({}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        getUserById(id, (result) => {
            return done(null, result);
        })
    });
}

module.exports = initialize;