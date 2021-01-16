const bcrypt = require('bcrypt');

exports.createUser = async (user) => {
    const query = 'INSERT INTO users(name, username, password) VALUES ?';
    const values = [
        [user.name, user.username, await bcrypt.hash(user.password, 12)]
    ];

    connection.query(query, [values], function(err, result) {
        if (err) {
            console.log(err);
            console.log('error in CREATE user query');
        } else {
            return result.insertId.toString();
        }
    })
}

exports.findUser = (req, res, next) => {
    const{username, password} = req.body;
    const query = 'SELECT id, password FROM users WHERE username = ?';
    connection.query(query, [username], async function(err, result) {
        if (err) {
            console.log(err);
            console.log('error in SELECT user query');
        } else {
            if (result.length === 0) {
                console.log('No user');
            } else {
                const dbPassword = result[0].password;
                const isValid = await bcrypt.compare(password, dbPassword);
                req.rows = isValid ? result : undefined;
            }
            return next();
        }
    })
}