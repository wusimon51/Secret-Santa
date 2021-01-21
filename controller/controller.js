const bcrypt = require('bcrypt');

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

exports.queryUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, password FROM users WHERE username = ?';
        connection.query(query, [username], function (err, result) {
            if (err) {
                console.log(err);
                console.log('error in SELECT user query');
                return reject(err);
            } else {
                if (result.length === 0) {
                    console.log('No user');
                    return reject('Empty user');
                } else {
                    resolve(result[0]);
                }
            }
        })
    })
}

exports.queryUserById = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT username, password FROM users WHERE id = ?';
        connection.query(query, [id], function (err, result) {
            if (err) {
                console.log('error in SELECT user query');
                return reject(err);
            } else {
                if (result.length === 0) {
                    console.log('No user');
                    return reject();
                } else {
                    console.log('result made in query');
                    resolve(result[0]);
                }
            }
        })
    });
}