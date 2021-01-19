const bcrypt = require('bcrypt');
const passport = require('passport');

exports.createUser = async (user) => {
    const query = 'INSERT INTO users(name, username, password) VALUES ?';
    const values = [
        [user.name, user.username, await bcrypt.hash(user.password, 12)]
    ];

    connection.query(query, [values], function (err, result) {
        if (err) {
            console.log(err);
            console.log('error in CREATE user query');
        } else {
            return result.insertId.toString();
        }
    })
}

exports.queryUser = (username, callback) => {
    console.log('queryUser called in controller');
    const query = 'SELECT id, password FROM users WHERE username = ?';
    connection.query(query, [username], function (err, result) {
        if (err) {
            console.log(err);
            console.log('error in SELECT user query');
            return null;
        } else {
            if (result.length === 0) {
                console.log('No user');
                return null;
            } else {
                console.log('result made in query');
                const user = result[0];
                callback(user);
            }
        }
    })
}