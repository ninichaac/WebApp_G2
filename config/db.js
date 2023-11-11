const mysql = require('mysql2');

 const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webapp'
 });

 module.exports = con;