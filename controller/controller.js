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

exports.createUser = (user) => {
    const query = 'INSERT INTO users(name, username, password) VALUES ?';
    const values = [
        [user.name, user.username, user.password]
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