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
                    return reject('No user');
                } else {
                    resolve(result[0]);
                }
            }
        })
    })
}

exports.queryUserById = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, name, username FROM users WHERE id = ?';
        connection.query(query, [id], function (err, result) {
            if (err) {
                console.log('error in SELECT user query');
                return reject(err);
            } else {
                if (result.length === 0) {
                    return reject('No user');
                } else {
                    resolve(result[0]);
                }
            }
        })
    });
}

exports.createEvent = async (event) => {
    let optionalCols = '';
    let values = [
        [event.name, event.adminId]
    ];
    if (event.password !== '') {
        values[0].push(await bcrypt.hash(event.password, 12));
        optionalCols += ', password';
    }
    if (event.budget !== '') {
        values[0].push(parseInt(event.budget));
        optionalCols += ', budget';
    }
    const query = `INSERT INTO events(name, admin_id${optionalCols}) VALUES ?`;

    connection.query(query, [values], function (err, result) {
        if (err) {
            console.log('error in INSERT INTO events query');
            console.log(err);
            return err;
        } else {
            return result.insertId.toString();
        }
    })
}