const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');
const { error } = require('console');
const memorystore = require('memorystore')(session);
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/img' });

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
    // res.send(req.session.username);
    res.json({ "id": req.session.user_id, "username": req.session.username, "role": req.session.role, "email": req.session.email });
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

// --------------booking room-----------
app.get("/Student/booking", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/booking.html'));
});

app.post("/Student/booking/book-room", function (req, res) {
    const { userId, room, date, time } = req.body;
    // const userId = req.session.user_id;
    if (!room || !date || !time) {
        return res.status(400).send("Please fill out all information completely.");
    }

    // Assuming default values for new columns
    const insertBooking = `
        INSERT INTO reserving 
        ( room_id,user_id,time_reserving, date_reserving,approved, message, comment_user, approver) 
        VALUES (?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
    `;

    con.query(insertBooking, [room, userId, time, date], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error during booking");
        } else {
            res.send('Booking successful!');
        }
    });
});

// ------------booking status--------------
app.get("/Student/status", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/status.html'));
});

app.put('/Student/status', function (req, res) {
    let id = req.body.id;
    let status = req.body.status;
    if (!id || !status) {
        return res.send({ msg: 'error' });
    }
    let data;
    // Map status values to appropriate data values
    switch (parseInt(status)) {
        case 1:
            data = 1; // Waiting
            break;
        case 2:
            data = 2; // Approved
            break;
        case 3:
            data = 3; // Disapproved
            break;
        default:
            return res.send({ msg: 'Invalid status' });
    }
    con.query("UPDATE reserving SET approved = ? WHERE reserving_id = ?", [data, id], function (error, result, field) {
        if (error) throw error;
        return res.send({ data: result, msg: 'update Successfully' });
    });
});







// ================STAFF===========================

// ----dashboard
app.get("/Staff/dashboard", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Staff/dashboard.html'));
});

// ------room list-----
app.get("/Staff/room-list", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Staff/roomlist.html'));
});
app.get("/room-list", function (req, res) {
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
// app.post("Staff/update-room/update-status"),function (req, res){
//     if(req.session.role != undefined && req.session.role == 3) {
//         let sql='';
//         let status = req.body.status
//         if(status == 'Available') {
//             sql = `UPDATE room SET room_status = 'Disabled' WHERE room_id = ?`
//         }else{
//             sql = `UPDATE room SET room_status = 'Available' WHERE room_id = ?`
//         }
//         let params = [req.body.room_id]
//         con.query(sql,params,(err,result)=>{
//             if(err){
//                 res.status(500).send("DB error");
//                 throw err;
//             }
//             console.log(req.session.email + 'open and close room')
//             res.send('/Staff/update-room')
//         })
//     }
// }

// app.post('/Staff/update-room/update-status', function (req, res) {
//     if (req.session.role != undefined && req.session.role == 3) {
//         let sql = '';
//         let room_status = req.body.room_status;
//         let room_id = req.body.params;

//         if (room_status == 'Available') {
//             sql = `UPDATE room SET room_status = 'Disabled' WHERE room_id = ?`;
//         } else {
//             sql = `UPDATE room SET room_status = 'Available' WHERE room_id = ?`;
//         }

//         let params = [room_id];
//         con.query(sql, params, (err, result) => {
//             if (err) {
//                 res.status(500).send("DB error");
//                 throw err;
//             }
//             // console.log(req.session.email + ' open and close room');
//             res.send('/Staff/update-room');
//         });
//     }
// });

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
    const sql = `SELECT email,user_id FROM user WHERE email = ?`;
    con.query(sql, [email], function (err, result) {
        // check for error
        if (err) {
            res.status(500).send('Server Error!');
        } else if (result.length != 1) {
            res.status(401).send('Email not found!');
        } else {
            //check email 
            if (result[0].user_id == 2 || result[0].user_id == 3) {
                res.status(400).send("This is Aj or Admin email!");
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
    // find older password
    const sql = `SELECT password FROM user WHERE user_id = ?`
    con.query(sql, [id], function (err, result) {
        if (err) {
            return res.status(500).send('Database Error!');
        }
        // check this password is use or not
        bcrypt.compare(password, result[0].password, function (err, same) {
            if (err) {
                return res.status(500).send('Compare Error!');
            }
            if (same) {
                res.status(401).send('This password is currently use!!');
            } else {
                bcrypt.hash(password, 10, function (err, hash) {
                    if (err) {
                        return res.status(500).send('Hash error!');
                    }
                    const sql = `UPDATE user SET password = ? WHERE user_id = ?`;
                    con.query(sql, [hash, id], function (err, result) {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Database error!');
                        }
                        if (result.affectedRows != 1) {
                            return res.status(500).send('Row delete more than 1');
                        }
                        res.send('Password has been changed!!!');
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

// ----status----
app.get('/Lecturer/status', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Lecturer/status.html'))
});

app.put('/Lecturer/status', function (req, res) {
    let id = req.body.id;
    let status = req.body.status;  // Assuming you pass the status in the request body

    if (!id || !status) {
        return res.send({ msg: 'error' });
    }

    let data;

    // Map status values to appropriate data values
    switch (parseInt(status)) {
        case 1:
            data = 1; // Waiting
            break;
        case 2:
            data = 2; // Approved
            break;
        case 3:
            data = 3; // Disapproved
            break;
        default:
            return res.send({ msg: 'Invalid status' });
    }

    con.query("UPDATE reserving SET approved = ? WHERE reserving_id = ?", [data, id], function (error, result, field) {
        if (error) throw error;
        return res.send({ data: result, msg: 'update Successfully' });
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
                } else {
                    if (same) {
                        req.session.username = username;
                        req.session.userID = results[0].id;
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
                }
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