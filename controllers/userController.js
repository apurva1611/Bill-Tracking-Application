const basicAuth = require('basic-auth');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const helper = require('../helper/helper');
const { fromString } = require('uuidv4');
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


exports.getAllusers = (req, res) => {
    mysqlConnection.query('SELECT * FROM users', (err, rows, fields) => {
        if (!err)
            res.status(200).json(rows);
        else{
            res.status(400).json({message:"Error Occurred"});
        }
    })
}
exports.checkBody = (req, res, next) => {
   if(req.body.first_name==undefined || req.body.last_name==undefined || req.body.email_address==undefined || req.body.password==undefined || helper.checkPassword(req.body.password)==false || helper.checkemail(req.body.email_address)==false){
       return  res.status(400).json({message:"Fields Missing"});
    }
    next();
  };
  exports.returnUser =(req, res) => {
    const sql = "SELECT id,firstName, lastName, email,accountCreated,accountUpdated FROM `users` WHERE `email`='"+req.body.email_address+"'";
     mysqlConnection.query(sql, 
     (err, rows, fields) => {
         if (!err){
             if(rows && rows.length){
                const data = {
                    id:rows[0].id,
                    first_name:rows[0].firstName,
                    last_name:rows[0].lastName,
                    email_address:rows[0].email,
                    account_created: rows[0].accountCreated,
                    account_updated: rows[0].accountUpdated
   
                }
               res.status(201).json(data);
             }
             else{
                res.status(400).json();  
             }

         }
             
         else{
            res.status(400).json();
         } 
     })
 };

exports.createUser =(req, res,next) => {
    const data = req.body;
    const fName = data.first_name;
    const lName = data.last_name;
    const email = data.email_address;
    const pwd =  data.password;
    const pwdHash = bcrypt.hashSync(pwd,10);
    const id = fromString(data.email_address);
    const createdDate = new Date().toISOString();
    var sql = "INSERT INTO `users`(`id`,`firstName`,`lastName`,`email`,`password`, `accountCreated`,`accountUpdated`) VALUES ('" + id +"','" + fName + "','" + lName + "','" + email + "','" + pwdHash + "','" + createdDate + "','" + createdDate + "')";
    mysqlConnection.query(sql, (err, result) => {
        if (!err)
        {
           next();
        }
            
        else
            res.status(400).json({message:"Already a user"});
    })
};

exports.getUser =(req, res) => {
    var user = basicAuth(req);
    if(user.name ==undefined || user.pass==undefined){
        return res.status(400);
    }
    const sql = "SELECT id,password,firstName, lastName, email,accountCreated,accountUpdated FROM `users` WHERE `email`='"+user.name+"'";
     mysqlConnection.query(sql, 
     (err, rows, fields) => {
         if (!err){
             if(rows && rows.length && bcrypt.compareSync(user.pass,rows[0].password)){
                const data = {
                    id:rows[0].id,
                    first_name:rows[0].firstName,
                    last_name:rows[0].lastName,
                    email_address:rows[0].email,
                    account_created: rows[0].accountCreated,
                    account_updated: rows[0].accountUpdated
   
                }
               res.status(200).json(data);
             }
             else{
                res.status(400).json({message:"Not a user"});  
             }

         }
             
         else{
            res.status(400).json();
         }    
     })
 };

exports.updateUser=(req,res) => {
    var user = basicAuth(req);
    const pwdHash = bcrypt.hashSync(req.body.password,10);
    const updatedDate = new Date().toISOString();
    var sqlUpdate =  "UPDATE users set firstName =? , lastName =?,password=?,accountUpdated=? WHERE email = ?";
    mysqlConnection.query(sqlUpdate, [req.body.first_name, req.body.last_name,pwdHash,updatedDate,user.name], (err, rows, fields) => {
        if (!err)
            res.status(204).json({message:"Updated Successfully"});
        else
            res.status(400).json();
    })
};
exports.checkUser = (req, res, next) => {
    var user = basicAuth(req);
    if(user.name ==undefined || user.pass==undefined){
        return res.status(400).json({message:"Authorization headers missing"});
    }
    if(req.body.email_address!=user.name){
       return res.status(400).json({message:"Authorization email and request email dont match"});
    }
    const sql = "SELECT id,firstName,password, lastName, email,accountCreated,accountUpdated FROM `users` WHERE `email`='"+user.name+"'";
    mysqlConnection.query(sql, 
        (err, rows, fields) => {
            if (!err){
                if(rows && rows.length && bcrypt.compareSync(user.pass,rows[0].password)){
                    next();
                }
                else{
                  res.status(400).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(400).json();
            }
                
        })
   };