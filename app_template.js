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
    res.json({ "id": req.session.userID, "username": req.session.username, "role": req.session.role });
});

// ------------- Edit a product --------------
app.put("/products/:id", function (req, res) {

});

// ------------- Add a new product --------------
app.post("/products", function (req, res) {

});

// ------------- DELETE a product --------------
app.delete("/products/:id", function (req, res) {

});

// ------------- GET all products --------------
app.get("/products", function (_req, res) {
    const sql = "SELECT* FROM product";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        } else {
            res.json(results);
        }
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
                        res.send('/welcome');
                    } else {
                        res.status(401).send('Wrong password');
                    }
                }
            });
        }
    });
});

// ============ Page routes =================
app.get('/shop', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/web_services/shop.html'));
    } else {
        res.redirect('/');
    }

});

// ------------ product page ----------
app.get('/welcome', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/web_services/welcome_template_get.html'))
    } else {
        res.redirect('/');
    }
});

// ------------ root service ----------
app.get('/', function (req, res) {
    if (req.session.role == 1) {
        res.redirect('/welcome');
    }
    if (req.session.role == 2) {
        res.redirect('/shop');
    }
    res.sendFile(path.join(__dirname, 'views/web_services/login_template.html'))
});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is running at port ' + PORT);
});