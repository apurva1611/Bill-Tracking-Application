const de =require('dotenv').config();
console.log(process.env.DB_HOST);
const mysql = require('mysql');
var mysqlConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    port:3306,
    password:process.env.DB_PASS,
    multipleStatements: true
});
mysqlConnection.connect((err) => {
    if (!err){
        console.log('DB connection succeded.');
    }
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});

module.exports = mysqlConnection;