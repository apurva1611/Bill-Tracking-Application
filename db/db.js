const mysql = require('mysql');
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'apurva',
    password: 'Rajuabha25!',
    database: 'db1',
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