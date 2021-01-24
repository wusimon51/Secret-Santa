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

exports.createEvent = (event, callback) => {
    let optionalCols = '';
    let values = [
        [event.name, event.adminId]
    ];
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
            callback(event.adminId, result.insertId, event.name);
            return result.insertId.toString();
        }
    })
}

exports.addParticipant = (userId, eventId, eventName) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO participants(user_id, event_id, event_name) VALUES ?`;
        const values = [
            [userId, eventId, eventName]
        ];
        connection.query(query, [values], function (err, result) {
            if (err) {
                console.log('error in INSERT INTO participants query');
                console.log(err);
                return reject(err);
            } else {
                return result.insertId.toString();
            }
        })
    })
}

exports.getParticipantsByEventId = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM participants WHERE event_id = ?`;
        const values = [[eventId]];
        connection.query(query, [values], function (err, result) {
            if (err) {
                console.log('error in SELECT FROM participants query');
                console.log(err);
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.getEventsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM participants WHERE user_id = ?';
        const values = [[userId]];
        connection.query(query, [values], function (err, result) {
            if (err) {
                console.log('error in SELECT FROM participants query');
                console.log(err);
                return reject(err);
            } else {
                resolve(result);
            }
        });
    })
}

exports.getEventByEventId = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events WHERE id = ?';
        const values = [[eventId]];
        connection.query(query, [values], function (err, result) {
            if (err) {
                console.log('error in SELECT FROM events query');
                console.log(err);
                return reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

exports.createInvite = (userId, invite) => {
    const query = 'INSERT INTO invites (user_id, admin_id, event_id, message) VALUES ?';
    const values = [
        [userId, invite.admin_id, invite.event_id, invite.message]
    ]
    connection.query(query, [values], function (err) {
        if (err) {
            console.log('error in INSERT INTO invites query');
            console.log(err);
            return err;
        }
    })
}

exports.getInvites = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM invites WHERE user_id = ?'
        const values = [[userId]]
        connection.query(query, [values], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.getInviteByInviteId = (inviteId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM invites WHERE id = ?';
        const values = [[inviteId]];
        connection.query(query, [values], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                resolve(result[0]);
            }
        })
    })
}

exports.removeInvite = (inviteId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM invites WHERE id = ?';
        const values = [[inviteId]];
        connection.query(query, [values], function (err, result) {
            if (err) {
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.getWishlist = (userId, eventId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM wishlists WHERE user_id = ? and event_id = ?';
        const values = [userId, eventId];
        connection.query(query, values, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.addItem = (item) => {
    return new Promise((resolve, reject) => {
        const optionalCol = item.price !== '' ? ', price' : '';
        const query = `INSERT INTO wishlists(user_id, name${optionalCol}, event_id) VALUES ?`;
        let values = [[item.user_id, item.name]];
        if (optionalCol !== '') {
            values[0].push(item.price);
        }
        values[0].push(item.event_id);
        connection.query(query, [values], function (err, result) {
            if (err) {
                console.log('error in INSERT INTO wishlists query');
                console.log(err);
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.removeItem = (itemId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM wishlists WHERE id = ?'
        const values = [[itemId]];
        connection.query(query, [values], function (err, result) {
            if (err) {
                console.log('error in DELETE FROM wishlists query');
                console.log(err);
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.startEvent = (eventId) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE events SET started = ? WHERE id = ?'
        const values = [1, eventId];
        connection.query(query, values, function (err, result) {
            if (err) {
                console.log('error in UPDATE events query');
                console.log(err);
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

exports.addRecipient = (recipientId, participantId) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE participants SET recipient_id = ? WHERE user_id = ?'
        const values = [recipientId, participantId];
        connection.query(query, values, function (err, result) {
            if (err) {
                console.log('error in UPDATE participants query');
                console.log(err);
                return reject(err);
            } else {
                resolve(result);
            }
        })
    })
}