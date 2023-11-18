const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');
const { error } = require('console');
const memorystore = require('memorystore')(session);

const app = express();

// set the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    secret: 'kuyyyyy',
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
    res.json({ "user_id": req.session.user_id, "username": req.session.username, "role": req.session.role, "email": req.session.email });
});





// ===================STUDENT===================================

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

// ------------- homepage--------------
app.get("/Student/homepage", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/homepage.html'));
});

// --------------all room------------
app.get("/Student/rooms/:id", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/search.html'));
});

app.get("/Student/rooms-list", function (req, res) {
    const sql = "SELECT * FROM room";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    })
});


// --------------booking room-----------
app.get("/Student/booking", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/booking.html'));
});

app.post("/Student/booking/:id", function (req, res) {
    const roomID = req.params.room_id
    let sql = 'INSERT INTO reserving (room_id,user_id,time_reserving,date_reserving,comment_user) VALUES ?';
    let params = [
        [
            // req.session.user_id,
            // req.params.room_id,
            req.body.user_id,
            req.body.room_id,
            req.body.time_reserving,
            req.body.date_reserving,
            req.body.comment_user
        ]
    ]
    con.query(sql,[params],(err,result) => {
        if(err){
            res.status(500).send("DB error");
            throw err;
        }
        sql = `UPDATE room SET time_slots = ? WHERE room_id =?`;
        params =[
            req.body.UpdateData,
            req.params.room_id
        ]
        con.query(sql,params,(err,result) => {
            if(err){
                res.status(500).send("DB error");
                throw err;
            }else{
                res.send('/Student/status');
            }
          
    });
});



    //     const { user_id, room_id, time_reserving, date_reserving } = req.body;

    //     // Check role of the user
    //     con.query('SELECT role FROM user WHERE user_id = ?', [user_id], function (error, results, fields) {
    //         if (error) {
    //             console.error(error);
    //             return res.status(500).send("Server error");
    //         }

    //         // Check if the user has role = 1 (student)
    //         if (results.length > 0 && results[0].role == 1) {
    //             if (!room_id || !time_reserving || !date_reserving) {
    //                 return res.status(400).send("Please fill out all information completely.");
    //             }

    //             // Assuming default values for new columns
    //             const insertBooking = ` INSERT INTO reserving(room_id, user_id, time_reserving, date_reserving, approved, message, comment_user, approver) 
    //             SELECT ?, ?, ?, ?, 'Waiting', 'Default', 'Default', 'Default' 
    //             FROM room
    //             WHERE room_id = ? AND room_status = 'Available'`;

    //             con.query(insertBooking, [room_id, user_id, time_reserving, date_reserving, room_id], function (err, results) {
    //                 if (err) {
    //                     console.error(err);
    //                     if (err.code == 'ER_DUP_ENTRY') {
    //                         return res.status(409).send('Room already booked');
    //                     }
    //                     return res.status(500).send('Server error during booking');
    //                 } else if (results.affectedRows == 0) {
    //                     return res.status(404).send('Room not available for booking');
    //                 } else {
    //                     return res.send('Booking successful!');
    //                 }
    //             });
    //         }
    //     });
});



// ------------booking status--------------
app.get("/Student/status", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/status.html'));
});







// ================STAFF===========================

// ----dashboard
app.get("/Staff/dashboard", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Staff/dashboard.html'));
});

app.get("/Staff/dashboard-list", function (req, res) {
    const sql = "SELECT room_status FROM room";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    });
});

// ------room list-----
app.get("/Staff/room-list", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Staff/roomlist.html'));
});

app.get("/Staff/room", function (req, res) {
    const sql = "SELECT * FROM room";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.json(results);
    })
})

// -----status------
app.get("/Staff/reservations", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Staff/status_staff.html'));
});

// -----history------
app.get("/Staff/history", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Staff/history.html'));
});

// ------------- Add a new room --------------
app.get("/Staff/update-room", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Staff/UpdateRoom.html'));
});

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
    const { room_id, room_status } = req.body;
    const sql = `UPDATE room SET room_status = ? WHERE room_id = ?`;

    con.query(sql, [room_status, room_id], (err, result) => {
        if (err) {
            console.error('Error updating room status:', err);
            res.status(500).send('Error updating room status');
            return;
        }
        console.log('Room status updated successfully');
        res.status(200).send('Room status updated successfully');
    });
});




// ===============forget password==============
app.get('/forgot-password', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/forgetpass.html'))
});

app.post('/forgot-password', function (req, res) {
    const { email } = req.body;
    const sql = `SELECT email,role FROM user WHERE email = ?`;
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
                res.send(`${result[0].user_id}`);
            }
        }
    });
});

// =============reset password==========
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
                        res.redirect('/login');
                    })
                });
            }
        });
    });
})






// ====================TEACHER==========================================
// -----dashboard-----------
app.get('/Lecturer/dashboard', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Lecturer/dashboard.html'))
});

// -----roomlist----
app.get('/Lecturer/room-list', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Lecturer/roomlist.html'))
});

// ---request---
app.get('/Lecturer/request', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Lecturer/request.html'))
});

// ----update status----
app.get('/Lecturer/status', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Lecturer/status.html'))
});

app.put('/Lecturer/status', function (req, res) {
    let reserving_id = req.body.reserving_id;
    let room_status = req.body.room_status;
    let message = req.body.message;
    let user_id = req.body.user_id;

    if (!reserving_id || !room_status || !user_id) {
        return res.send({ msg: 'error' });
    }

    con.query('SELECT role FROM user WHERE user_id = ?', [user_id], function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0 && results[0].role == 2) {
            let data;
            let sqlParams;

            switch (parseInt(room_status)) {
                case 1:
                    data = 1; // Approved
                    sqlParams = [data, user_id, reserving_id];
                    break;
                case 2:
                    data = 2; // Disapproved
                    if (!message) {
                        return res.send({ msg: 'Please provide a message for disapproval' });
                    }
                    sqlParams = [data, message, user_id, reserving_id];
                    break;
                case 3:
                    data = 3; // Waiting
                    sqlParams = [data, user_id, reserving_id];
                    break;
                default:
                    return res.send({ msg: 'Invalid status' });
            }

            const sql = `UPDATE reserving SET approved = ?, ${room_status == '2' ? 'message = ?,' : ''} approver = ? WHERE reserving_id = ?`;
            con.query(sql, sqlParams, function (error, result, field) {
                if (error) throw error;
                return res.send({ data: result, msg: 'update Successfully' });
            });
        } else {
            return res.send({ msg: 'User is not authorized for this action' });
        }
    });
});




// -----history----
app.get('/Lecturer/history', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Lecturer/history.html'))
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
                    // if (same) 
                    // {
                    req.session.username = username;
                    req.session.userID = results[0].id;
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
                    res.status(401).send('Login failed - Invalid credentials');
                }
                // }
            });
        }
    });
});



// ============ Page routes =================
app.get('/Lecturer/dashboard', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/Lecturer/dashboard.html'));
    } else {
        res.redirect('/');
    }

});

app.get('/Staff/dashboard', function (req, res) {
    if (req.session.role == 3) {
        res.sendFile(path.join(__dirname, 'views/Staff/dashboard.html'));
    } else {
        res.redirect('/');
    }

});

// ------------ product page ----------
app.get('/Student/homepage', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/Student/homepage.html'))
    } else {
        res.redirect('/');
    }
});

// ------------ root service ----------
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/views/login.html'))
});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is running at port ' + PORT);
});