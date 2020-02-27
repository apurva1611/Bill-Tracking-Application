const mysql = require('mysql');
var mysqlConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    port:3306,
    user:process.env.DB_USER,
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