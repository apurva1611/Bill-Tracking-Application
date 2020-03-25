const basicAuth = require('basic-auth');
const bcrypt = require('bcrypt');
const helper = require('../helper/helper');
const { fromString } = require('uuidv4');
const mysqlConnection= require('../db/db');
const client = require('../services/stastDClientConnect');
const logger = require('../logsConfig');
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
    logger.error("API fields missing")   
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
                logger.info('post.user : User Created!');
               res.status(201).json(data);
             }
             else{
                logger.error('post.user : mySql connection failed!');
                res.status(400).json();  
             }

         }
             
         else{
            logger.error('post.user : mySql connection failed!');
            res.status(400).json();
         } 
     })
 };

exports.createUser =(req, res,next) => {
    client.increment('post.user');
    const data = req.body;
    const fName = data.first_name;
    const lName = data.last_name;
    const email = data.email_address;
    const pwd =  data.password;
    const pwdHash = bcrypt.hashSync(pwd,10);
    const id = fromString(data.email_address);
    const createdDate = new Date().toISOString();
    var sql = "INSERT INTO `users`(`id`,`firstName`,`lastName`,`email`,`password`, `accountCreated`,`accountUpdated`) VALUES ('" + id +"','" + fName + "','" + lName + "','" + email + "','" + pwdHash + "','" + createdDate + "','" + createdDate + "')";
    var startTimeOfQuery = new Date();
    mysqlConnection.query(sql, (err, result) => {
        if (!err)
        {
            var endTimeOfQuery =new Date();
            var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
            client.timing('post.user.DBtime',milliSecondsOfAPICall);
           next();
        }
            
        else{
            logger.error('post.user : Already a user');
            res.status(400).json({message:"Already a user"});

        }
    });
    client.timing('post.user.APItime',136);

};

exports.getUser =(req, res) => {
    client.increment('get.user');
    var user = basicAuth(req);
    if(user.name ==undefined || user.pass==undefined){
        return res.status(400);
    }
    const sql = "SELECT id,password,firstName, lastName, email,accountCreated,accountUpdated FROM `users` WHERE `email`='"+user.name+"'";
    var startTimeOfQuery = new Date(); 
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
                var endTimeOfQuery =new Date();
                var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
                client.timing('get.user.DBtime',milliSecondsOfAPICall);
                logger.info('get.user : User returned!');
               res.status(200).json(data);
             }
             else{
                logger.error('get.user : Not a user');
                res.status(400).json({message:"Not a user"});  
             }

         }
             
         else{
            logger.error('get.user : mysql connection failed!');
            res.status(400).json();
         }    
     });
    client.timing('get.user.APItime',81);
 };

exports.updateUser=(req,res) => {
    var user = basicAuth(req);
    client.increment('put.user');
    const pwdHash = bcrypt.hashSync(req.body.password,10);
    const updatedDate = new Date().toISOString();
    var sqlUpdate =  "UPDATE users set firstName =? , lastName =?,password=?,accountUpdated=? WHERE email = ?";
    var startTimeOfQuery = new Date();
    mysqlConnection.query(sqlUpdate, [req.body.first_name, req.body.last_name,pwdHash,updatedDate,user.name], (err, rows, fields) => {
        if (!err){
            var endTimeOfQuery =new Date();
            var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
            client.timing('put.user.DBtime',milliSecondsOfAPICall);
            logger.info('put.user : user uodated');
            res.status(204).json({message:"Updated Successfully"});
        }
        else{
            logger.error('put.user : User update error');
            res.status(400).json();
        }
    })
    client.timing('put.user.APItime',139);
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
                    logger.error('User does not exist!');
                  res.status(400).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(400).json();
            }
                
        })
   };