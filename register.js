const express = require('express');
const con = require('./config/db');
const bcrypt = require("bcrypt");
const path = require('path');
const app = express();

//go to register page
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
            return res.status(500).send("Hash error!");
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
                con.query(sql, [username, email], function (err, _results) {
                    if (err) {
                        console.error(err);
                        res.status(500).send("Server error insert data!");
                    } else {
                        res.send('views/Student/login');
                    }
                });
            }
        })
    });
});

const port = 3000;
app.listen(port, function () {
    console.log("Server is running at port " + port);
});