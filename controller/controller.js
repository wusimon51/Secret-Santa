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

exports.getUser = (req, res, next) => {
    const query = 'SELECT name, username, password FROM users WHERE id = ?';
    let id = req.params.id;
    connection.query(query, [id], function(err, rows) {
        if (err) {
            console.log(err);
            console.log('error in SELECT user query');
        } else {
            req.rows = rows;
            return next();
        }
    })
}