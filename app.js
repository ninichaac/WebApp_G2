const express = require("express");
const path = require('path');
const app = express();
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//web services
// post login
app.post('/login', function (req, res) {
    const { username, password } = req.body;
    // console.log(username,password);
    // res.end();
    if (username == 'admin' && password == '1234') {
        res.send('Login success');
    } else {
        res.status(401).send('Login failed');
    }
})

// get login
app.get('/login/:username/:password', function (req, res) {
    // const username = req.params.username;
    // const password = req.params.password;
    const { username, password } = req.params;
    // console.log(username,password);
    // res.end();
    if (username == 'admin' && password == '1234') {
        res.send('Login success');
    } else {
        res.status(401).send('Login failed');
    }
})

// get current date time
app.get('/now', function (_req, res) {
    res.send(new Date().toLocaleString());
});

//root
//put _ before parameter for not use
app.get('/', function (_req, res) {
    // res.status(200).send('Hello worldddddd');
    // res.status(200).sendFile(__dirname + '/views/web_services/index.html');
    res.status(200).sendFile(path.join(__dirname, '/views/web_services/index.html'));
});


//start server
const port = 3000;
app.listen(port, function () {
    console.log("Server is running at port " + port);
});