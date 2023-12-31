const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');
const { error } = require('console');
const memorystore = require('memorystore')(session);
const bodyParser = require('body-parser');

const app = express();

// set the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    secret: 'yyyyy',
    resave: false,
    saveUninitialized: true,
    store: new memorystore({ checkPeriod: 24 * 60 * 60 * 1000 })
}));


// ------------- logout --------------
app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            return res.status(500).send('Session error');
        }
        res.redirect('/login');
    })
});

//-------------- Get User info ---------------
app.get('/user', function (req, res) {
    res.json({
        "user_id": req.session.user_id,
        "username": req.session.username,
        "role": req.session.role,
        "email": req.session.email
    });
});

app.delete('/delete-all-reservations', async (req, res) => {
    try {
        const [results, fields] = await con.execute('DELETE FROM reserving');
        console.log('Deleted all reservations successfully');

        res.status(200).json({ message: 'Deleted all reservations successfully' });
    } catch (error) {

        res.status(500).json({ error: 'Failed to delete all reservations' });
    }
});



// ==============================STUDENT===================================
// ------------------register-----------------
app.get('/register', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/register.html'));
});

// register to database
app.post('/register', function (req, res) {
    const { username, email, password, compass } = req.body;
    if (!username || !email || !password || !compass) {
        return res.status(400).send("Registration failed - Invalid data");
    }
    // hash pass
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            return res.status(500).send("Registration failed - Server error");
        }

        // find email
        const findEmail = 'SELECT email FROM user WHERE email = ?';
        con.query(findEmail, [email], function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).send("Registration failed - Server error");
            }
            else if (result.length > 0) {
                res.status(401).send("Email has already used!");
            } else {
                // check password
                if (password !== compass) {
                    return res.status(401).send('Password miss match!');
                }
                // correct data
                const sql = `INSERT INTO user (username, email, password,role) VALUES (?,?,?,1)`;
                con.query(sql, [username, email, hash], function (err, _results) {
                    if (err) {
                        console.error(err);
                        res.status(500).send("Registration failed - Server error");
                    } else {
                        res.send('/login');
                    }
                }
                )
            };
        });
    });
});

// get room information
app.get("/Student/rooms-list", function (req, res) {
    const sql = `SELECT * FROM room`;
    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// get status for timeslots
app.get("/Student/rooms-status", function (req, res) {
    const roomId = req.query.roomId;
    const timeReserving = req.query.time;
    const sql = `
    SELECT r.approved 
    FROM reserving r 
    INNER JOIN (
        SELECT room_id, MAX(reserving_id) AS latest_reserving_id
        FROM reserving 
        WHERE room_id = ? AND time_reserving = ?
        GROUP BY room_id, time_reserving
    ) latest 
    ON r.reserving_id = latest.latest_reserving_id`;
    con.query(sql, [roomId, timeReserving], function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        if (results.length > 0) {
            res.json({ status: results[0].approved });
        } else {
            res.json({ status: "Available" });
        }
    });
});

// get room for booking room of room_id
app.get('/Student/booking/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const sql = 'SELECT * FROM room WHERE room_id = ?';

    con.query(sql, roomId, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (result.length == 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(result[0]);
    });
});

// booking room to database
app.post("/Student/booking-room", function (req, res) {
    const { room_id, date_reserving, time_reserving, comment_user } = req.body;
    user_id = req.session.user_id;

    const checkExistingBooking = "SELECT * FROM reserving WHERE room_id = ? AND date_reserving = ? AND time_reserving = ? AND approved IN ('Waiting', 'Approve')";
    con.query(checkExistingBooking, [room_id, date_reserving, time_reserving], function (checkErr, checkResult) {
        if (checkErr) {
            res.status(500).send('DB error');
        } else {
            if (checkResult.length > 0) {
                const alreadyBooked = checkResult.some(row => row.approved === 'Waiting' || row.approved === 'Approve');
                if (alreadyBooked) {
                    res.status(400).send('This time has already been booked');
                } else {
                    const insertBookingQuery = `INSERT INTO reserving (room_id, user_id, time_reserving, date_reserving, approved, comment_user) VALUES (?, ?, ?, ?, 'Waiting', ?)`;
                    con.query(insertBookingQuery, [room_id, user_id, time_reserving, date_reserving, comment_user], function (err, result) {
                        if (err) {
                            console.error(err.message);
                            res.status(500).send(err.message);
                        } else {
                            res.send('/Student/status');
                        }
                    });
                }
            } else {
                const insertBookingQuery = `INSERT INTO reserving (room_id, user_id, time_reserving, date_reserving, approved, comment_user) VALUES (?, ?, ?, ?, 'Waiting', ?)`;
                con.query(insertBookingQuery, [room_id, user_id, time_reserving, date_reserving, comment_user], function (err, result) {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send(err.message);
                    } else {
                        res.send('/Student/status');
                    }
                });
            }
        }
    });
});

// get time booking
app.get('/Student/get-booked-times', (req, res) => {
    const roomId = req.query.room_id;
    const currentDate = req.query.date;

    const checkBookingQuery = `SELECT time_reserving FROM reserving WHERE room_id = ? AND date_reserving = ? AND approved IN ('Waiting', 'Approve')`;
    con.query(checkBookingQuery, [roomId, currentDate], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        } else {
            const bookedTimes = result.map(row => row.time_reserving);
            res.json(bookedTimes);
        }
    });
});

// booking status for user_id
app.get("/Student/status_booking", function (req, res) {
    const user_id = req.session.user_id;
    const sql = `SELECT reserving.*, room.room_img, room.room_name, room.room_place, room.room_people
    FROM reserving
    INNER JOIN room ON reserving.room_id = room.room_id
    WHERE reserving.user_id = ?`;

    con.query(sql, [user_id], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});


// ===============forget password==============
// forget password page
app.get('/forgot-password', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/forgetpass.html'))
});

app.post('/forgot-password', function (req, res) {
    const { email } = req.body;
    const sql = `SELECT email,role,user_id FROM user WHERE email = ?`;
    con.query(sql, [email], function (err, result) {
        // check for error
        if (err) {
            res.status(500).send('Server Error!');
        } else if (result.length != 1) {
            res.status(401).send('Email not found!');
        } else {
            //check email 
            if (result[0].role == 2 || result[0].role == 3) {
                res.status(400).send("This is Staff or Lecturer email!");
            } else {
                const user_id = result[0].user_id;
                res.send(`${user_id}`);
            }
        }
    });
});

// =============reset password==========
// reset password page
app.get('/forgot-password/reset-password', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/resetpass.html'))
});

app.post('/forgot-password/reset-password/:id', function (req, res) {
    const id = req.params.id;
    const { password } = req.body;

    const sql = `SELECT password FROM user WHERE user_id = ?`
    con.query(sql, [id], function (err, result) {
        if (err) {
            return res.status(500).send('Database Error!');
        }

        // Check if result exists and has data
        if (!result || result.length == 0 || !result[0].password) {
            return res.status(401).send('User or password not found!');
        }

        bcrypt.compare(password, result[0].password, function (err, same) {
            if (err) {
                return res.status(500).send('Compare Error!');
            }
            if (same) {
                res.status(401).send('This password is currently in use!');
            } else {
                bcrypt.hash(password, 10, function (err, hash) {
                    if (err) {
                        return res.status(500).send('Hash error!');
                    }
                    const updateSql = `UPDATE user SET password = ? WHERE user_id = ?`;
                    con.query(updateSql, [hash, id], function (err, result) {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Database error!');
                        }
                        if (result.affectedRows !== 1) {
                            return res.status(500).send('More than one row deleted');
                        }
                        res.send('Password has been changed!!!');
                    })
                });
            }
        });
    });
})





// ==========================STAFF============================

//count of Available/Disable room
app.get("/Staff/dashboard-list/room", function (req, res) {
    const sql = "SELECT room_status FROM room";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

//count of reserving slots
app.get("/Staff/dashboard-list/reserving", function (req, res) {
    const sql = `
    SELECT reserving.*,room.room_name AS room_name
    FROM reserving
    INNER JOIN room ON reserving.room_id = room.room_id
    WHERE reserving.approved = 'Approve'`;

    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// recent activity of all teacher for staff
app.get("/Staff/activity", function (req, res) {
    const sql = `
    SELECT reserving.*, user.username, room.room_name
    FROM reserving
    INNER JOIN user ON reserving.user_id = user.user_id
    INNER JOIN room ON reserving.room_id = room.room_id 
    WHERE reserving.approved IN ('Approve', 'Disapprove')
    `;
    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// getroom detail
app.get("/Staff/roomslist", function (req, res) {
    const sql = `SELECT * FROM room`;
    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});
// get status for timeslots of room
app.get("/Staff/rooms-status", function (req, res) {
    const roomId = req.query.roomId;
    const timeReserving = req.query.time;
    const sql = `
    SELECT r.approved 
    FROM reserving r 
    INNER JOIN (
        SELECT room_id, MAX(reserving_id) AS latest_reserving_id
        FROM reserving 
        WHERE room_id = ? AND time_reserving = ?
        GROUP BY room_id, time_reserving
    ) latest 
    ON r.reserving_id = latest.latest_reserving_id`;
    con.query(sql, [roomId, timeReserving], function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        if (results.length > 0) {
            res.json({ status: results[0].approved });
        } else {
            res.json({ status: "Available" });
        }
    });
});

// allstatus
app.get('/Staff/Status', function (req, res) {
    const approver = req.session.username;
    const sql = `
        SELECT reserving.*, user.username AS username, room.room_name AS room_name
        FROM reserving
        INNER JOIN user ON reserving.user_id = user.user_id
        INNER JOIN room ON reserving.room_id = room.room_id
        WHERE reserving.approved IN ('Approve', 'Disapprove')`;

    con.query(sql, [approver], function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// ----history ดึงข้อมูลทั้งหมดในตารางของ reserving ดึงชื่อคนจองผ่าน user_id และดึงชื่อห้องผ่าน room_id
app.get("/Staff/getHistory", function (req, res) {
    const sql = `
    SELECT reserving.*, user.username, room.room_name
    FROM reserving
    INNER JOIN user ON reserving.user_id = user.user_id
    INNER JOIN room ON reserving.room_id = room.room_id 
    `;
    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// ------------- Add a new room --------------
app.post("/Staff/update-room", function (req, res) {
    const { roomImg, roomNum, roomLoca, people } = req.body;
    if (!roomImg || !roomNum || !roomLoca || !people) {
        return res.status(400).send("Please fill out all information completely.");
    }
    const sql = `INSERT INTO room (room_img,room_name, room_place, room_people, time_slots,room_status) VALUES (?,?,?,?,'8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.','Available')`;
    con.query(sql, [roomImg, roomNum, roomLoca, people], function (err, _results) {
        if (err) {
            console.error(err);
            res.status(500).send("Incomplete data: Missing fields");
        } else {
            // res.send('Room added successfully');
            res.send('/Staff/update-room');
        }
    });
});

// ------------- disabled a room --------------
app.post('/Staff/update-room/update-room-status', (req, res) => {
    const { rooms, status } = req.body;
    const sql = `UPDATE room SET room_status = ? WHERE room_id IN (?)`;

    con.query(sql, [status, rooms], (err, result) => {
        if (err) {
            console.error('Error updating room status:', err);
            res.status(500).send('Error updating room status');
            return;
        }
        console.log('Room status updated successfully');
        res.status(200).send('Room status updated successfully');
    });
});






// ===============================TEACHER==========================================

//count of Available/Disable room
app.get("/Lecturer/dashboard-list/room", function (req, res) {
    const sql = "SELECT room_status FROM room";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

//count of reserving slots
app.get("/Lecturer/dashboard-list/reserving", function (req, res) {
    const sql = `
    SELECT reserving.*,room.room_name AS room_name
    FROM reserving
    INNER JOIN room ON reserving.room_id = room.room_id
    WHERE reserving.approved = 'Approve'`;

    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// get recent activity for teacher
app.get("/Lecturer/activity", function (req, res) {
    const approverUsername = req.session.username;
    const sql = `
    SELECT reserving.*, user.username, room.room_name
    FROM reserving
    INNER JOIN user ON reserving.user_id = user.user_id
    INNER JOIN room ON reserving.room_id = room.room_id
    WHERE reserving.approved IN ('Approve', 'Disapprove') AND reserving.approver = '${approverUsername}'
    `;

    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

//allroomlist
app.get("/Lecturer/roomslist", function (req, res) {
    const sql = `SELECT * FROM room`;
    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// statusroom
app.get("/Lecturer/rooms-status", function (req, res) {
    const roomId = req.query.roomId;
    const timeReserving = req.query.time;
    const sql = `
    SELECT r.approved 
    FROM reserving r 
    INNER JOIN (
        SELECT room_id, MAX(reserving_id) AS latest_reserving_id
        FROM reserving 
        WHERE room_id = ? AND time_reserving = ?
        GROUP BY room_id, time_reserving
    ) latest 
    ON r.reserving_id = latest.latest_reserving_id`;
    con.query(sql, [roomId, timeReserving], function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        if (results.length > 0) {
            res.json({ status: results[0].approved });
        } else {
            res.json({ status: "Available" });
        }
    });
});

// get allrequest 
app.get('/Lecturer/allrequest', function (req, res) {
    const sql = `
    SELECT reserving.*, user.username AS username, room.room_name AS room_name
    FROM reserving
    INNER JOIN user ON reserving.user_id = user.user_id
    INNER JOIN room ON reserving.room_id = room.room_id
    WHERE reserving.approved = 'Waiting'`;
    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
        console.log(results)
    });
});

// approve/disapprove
app.put('/Lecturer/updateStatus/:id', (req, res) => {
    const reservingId = req.body.reserving_id;
    const message = req.body.message;
    const approved = req.body.approved;
    const approver = req.session.username;

    if (!approver) {
        return res.status(400).send('Unauthorized: Approver field cannot be empty');
    }

    const sql = "UPDATE reserving SET approved=? , message=?,approver=? WHERE reserving_id=?"
    con.query(sql, [approved, message, approver, reservingId], function (err, result) {
        if (err) {
            res.status(500).send('DB error');
        } else {
            if (result.affectedRows > 0) {
                res.send('Update successful');
            } else {
                res.status(404).send('Room not found');
            }
        }
    })
});

// get status for teacher who approver
app.get('/Lecturer/reserving_status', function (req, res) {
    const approver = req.session.username;
    const sql = `
        SELECT reserving.*, user.username AS username, room.room_name AS room_name
        FROM reserving
        INNER JOIN user ON reserving.user_id = user.user_id
        INNER JOIN room ON reserving.room_id = room.room_id
        WHERE reserving.approved IN ('Approve', 'Disapprove') AND  reserving.approver = '${approver}'`;

    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// get history for teacher who approver
app.get("/Lecturer/getHistory", function (req, res) {
    const approverUsername = req.session.username;
    const sql = `
    SELECT reserving.*, user.username, room.room_name
    FROM reserving
    INNER JOIN user ON reserving.user_id = user.user_id
    INNER JOIN room ON reserving.room_id = room.room_id
    WHERE reserving.approved IN ('Approve', 'Disapprove') AND reserving.approver = '${approverUsername}'
    `;

    con.query(sql, function (err, results) {
        if (err) {
            console.log(err.message);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});











// ---------- password generator -----------
app.get('/password/:raw', function (req, res) {
    const raw = req.params.raw;
    bcrypt.hash(raw, 10, function (err, hash) {
        if (err) {
            res.status(500).send('Hash error');
        } else {
            res.send(hash);
        }

    });
});

// ---------- login -----------
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

app.post('/login', function (req, res) {
    const { username, password } = req.body;
    const sql = "SELECT* FROM user WHERE username=?";
    con.query(sql, [username], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        } else if (results.length != 1) {
            res.status(401).send('Wrong username');
        } else {
            // compare raw password with hash password
            bcrypt.compare(password, results[0].password, function (err, same) {
                if (err) {
                    res.status(500).send('Password error');
                } else if (same) {
                    req.session.username = username;
                    req.session.user_id = results[0].user_id;
                    req.session.email = results[0].email;
                    req.session.role = results[0].role;
                    if (results[0].role == 1) {
                        res.send('/Student/homepage');
                    }
                    if (results[0].role == 2) {
                        res.send('/Lecturer/dashboard');
                    }
                    if (results[0].role == 3) {
                        res.send('/Staff/dashboard');
                    }
                } else {
                    res.status(401).send('Login failed!');
                }
            });
        }
    });
});


// ============ Page routes =================

//================ teacher page =================
// dashboard page
app.get('/Lecturer/dashboard', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/Lecturer/dashboard.html'));
    } else {
        res.redirect('/');
    }
});

// room list page
app.get('/Lecturer/room-list', ensureAuthenticated, function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/Lecturer/roomlist.html'))
    } else {
        res.redirect('/');
    }
});

// request page
app.get('/Lecturer/request', ensureAuthenticated, function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/Lecturer/request.html'))
    } else {
        res.redirect('/');
    }
});

// status page
app.get('/Lecturer/status', ensureAuthenticated, function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/Lecturer/lecturer_status.html'))
    } else {
        res.redirect('/');
    }
});

// history page
app.get('/Lecturer/history', ensureAuthenticated, function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/Lecturer/history.html'))
    } else {
        res.redirect('/');
    }
});



//================ staff page ===================
// dashboard page
app.get('/Staff/dashboard', function (req, res) {
    if (req.session.role == 3) {
        res.sendFile(path.join(__dirname, 'views/Staff/dashboard.html'));
    } else {
        res.redirect('/');
    }

});

// room list page
app.get('/Staff/room-list', ensureAuthenticated, function (req, res) {
    if (req.session.role == 3) {
        res.sendFile(path.join(__dirname, 'views/Staff/roomlist.html'));
    } else {
        res.redirect('/');
    }
});

// status page
app.get('/Staff/reservations', ensureAuthenticated, function (req, res) {
    if (req.session.role == 3) {
        res.sendFile(path.join(__dirname, 'views/Staff/status_staff.html'));
    } else {
        res.redirect('/');
    }
});

// history page
app.get('/Staff/history', ensureAuthenticated, function (req, res) {
    if (req.session.role == 3) {
        res.sendFile(path.join(__dirname, 'views/Staff/history.html'));
    } else {
        res.redirect('/');
    }
});

// update room page
app.get('/Staff/update-room', ensureAuthenticated, function (req, res) {
    if (req.session.role == 3) {
        res.sendFile(path.join(__dirname, 'views/Staff/UpdateRoom.html'));
    } else {
        res.redirect('/');
    }
});



//================ student page ===================
// home page
app.get('/Student/homepage', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/Student/homepage.html'))
    } else {
        res.redirect('/');
    }
});

// room list page
app.get('/Student/rooms/:id', ensureAuthenticated, function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/Student/search.html'));
    } else {
        res.redirect('/');
    }
});

// booking page
app.get('/Student/booking', ensureAuthenticated, function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/Student/booking.html'));
    } else {
        res.redirect('/');
    }
});

// status booking page
app.get('/Student/status', ensureAuthenticated, function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/Student/status.html'));
    } else {
        res.redirect('/');
    }
});

function ensureAuthenticated(req, res, next) {
    // Check if the user is logged in (authenticated)
    if (req.session && req.session.user_id) {
        // If authenticated, continue to the next middleware/route handler
        return next();
    } else {
        // If not authenticated, redirect to the login page or send an unauthorized response
        res.status(401).redirect('/login'); // You can customize the redirect URL or response as needed
    }
}

// ------------ root service ----------
app.get('/', function (req, res) {
    if (req.session.role == 1) {
        res.redirect('/Student/homepage');
    } else if (req.session.role == 2) {
        res.redirect('/Staff/dashboard');
    }
    else if (req.session.role == 3) {
        res.redirect('/Lecturer/dashboard');
    } else {
        res.sendFile(path.join(__dirname, '/views/login.html'))
    }
});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is running at port ' + PORT);
});