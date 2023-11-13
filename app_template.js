const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');
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
        res.redirect('/');
    })
});

//-------------- Get User info ---------------
app.get('/user', function (req, res) {
    // res.send(req.session.username);
    res.json({ "id": req.session.user_id, "username": req.session.username, "role": req.session.role ,"email": req.session.email});
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
        return res.status(400).send("Please fill out all information completely.");
    }
    // hash pass
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
            return res.status(500).send(err.message);
        } else {
            res.send(hash);
        }
        // find email
        const findEmail = 'SELECT email FROM user WHERE email = ?';
        con.query(findEmail, [email], function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).send("Server error!");
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
                        res.status(500).send("Server error insert data!");
                    } else {
                        res.send('views/login');
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


// ------------booking status--------------
app.get("/Student/status", function (req, res) {
    res.sendFile(path.join(__dirname, 'views/Student/status.html'));
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

app.post("/Staff/update-room/add", function (req, res) {
    const {roomNum, roomLoca,people} = req.body;
    if (!roomNum || !roomLoca || !people) {
        return res.status(400).send("Please fill out all information completely.");
    }
    const sql = `INSERT INTO room (room_name, room_place, room_people) VALUES (?,?,?)`;
    con.query(sql, [roomNum,roomLoca,people], function (err, _results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error insert data!");
        } else {
            res.send('views/Staff/UpdateRoom.html');
      }

    });
});

// ------------- disabled a room --------------
app.delete("/products/:id", function (req, res) {

});

// ===============forget password
app.get('/forgot-password', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/forgetpass.html'))
});

app.post('/forgot-password', function (req, res) {
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
app.get('/login', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/login.html'));
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
                        res.send('/');
                    } else {
                        res.status(401).send('Wrong password');
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
    if (req.session.role == 1) {
        res.redirect('/Student/homepage');
    }
    if (req.session.role == 2) {
        res.redirect('/Lecturer/dashboard');
    }
    if (req.session.role == 3) {
        res.redirect('/Staff/dashboard');
    }
    res.sendFile(path.join(__dirname, 'views/login.html'))
});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is running at port ' + PORT);
});