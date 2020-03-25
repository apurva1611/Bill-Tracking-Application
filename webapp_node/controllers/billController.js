const basicAuth = require('basic-auth');
const bcrypt = require('bcrypt');
var fs = require('fs');
const { fromString } = require('uuidv4');
const AWS = require('aws-sdk')
const mysqlConnection= require('../db/db');
const client = require('../services/stastDClientConnect');
const logger = require('../logsConfig');
exports.checkBody = (req, res, next) => {
    if(req.body.vendor==undefined || req.body.bill_date==undefined || req.body.due_date==undefined || req.body.amount_due==undefined || req.body.payment_status==undefined || isNaN(req.body.amount_due)|| req.body.amount_due<0.01 || req.body.attachment==undefined || Object.keys(req.body.attachment).length){
        logger.error("Fields missing of bill!");
        return  res.status(400).json({message:"Fields Missing"});
     }
     next();
   };
exports.setId = (req, res, next) => {
    const sql = "SELECT id_auto FROM `bill`";
    mysqlConnection.query(sql,
        (err, rows, fields) => {
            if (!err){
                let id  = rows.length?rows[rows.length-1].id_auto:0;
                id++;
                res.locals.billsLength = id.toString();
                next();
            }     
            else{
                res.status(400).json({message:"Error Occurred"});
            }
        })
   };
exports.checkUser = (req, res, next) => {
    var user = basicAuth(req);
    if(user && (!user.name ||!user.pass)){
        logger.error("post.bill : Authorization details of user missing!");
        return res.status(400).json({message:"Authorization headers missing"});
    }
    const sql = "SELECT id,firstName,password, lastName, email,accountCreated,accountUpdated FROM `users` WHERE `email`='"+user.name+"'";
    mysqlConnection.query(sql, 
        (err, rows, fields) => {
            if (!err){
                if(rows && rows.length && bcrypt.compareSync(user.pass,rows[0].password)){
                    res.locals.owner_id = rows[0].id;
                    next();
                }
                else{
                logger.error("post.bill : User does not exist!");
                  res.status(400).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(400).json({message:"failed"});
            }
                
        })
   };

   exports.createBill =(req, res,next) => {
    client.increment('post.bill');
    const data = req.body;
    const owner_id = res.locals.owner_id;
    const vendor = data.vendor;
    const bill_date = data.bill_date;
    const due_date = data.due_date;
    const amount_due =  data.amount_due;
    const categories = data.categories;
    const payment_status = data.payment_status;
    const id =fromString(res.locals.billsLength);
    const createdDate = new Date().toISOString();
    var sql = "INSERT INTO `bill`(`id`,`created_ts`,`updated_ts`,`owner_id`,`vendor`, `bill_date`,`due_date`,`amount_due`,`categories`,`payment_status`) VALUES ('" + id +"','"+ createdDate + "','" + createdDate + "','" + owner_id + "','" + vendor + "','" + bill_date + "','" + due_date + "','" + amount_due + "','" + categories+ "','" + payment_status + "')";
    var startTimeOfQuery = new Date();
    mysqlConnection.query(sql, (err, result) => {
        if (!err)
        {  
            var endTimeOfQuery =new Date();
            var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
            client.timing('post.bill.DBtime',milliSecondsOfAPICall);
            logger.info("Bill Created!");
           res.locals.id = id;
           next();
        }
            
        else
            res.status(400).json({message:"Failed inserting a bill"});
    })
    client.timing('post.bill.APItime',92);
};

exports.returnBill =(req, res) => {
    const sql = "SELECT id,created_ts,updated_ts,owner_id,vendor,bill_date,due_date,amount_due,categories,payment_status FROM `bill` WHERE `id`='"+res.locals.id+"'";
     mysqlConnection.query(sql, 
     (err, rows, fields) => {
         if (!err){
             if(rows && rows.length){
                rows.forEach(row => {
                    if(row.attachment!=null){
                        row.attachment = JSON.parse(row.attachment);
                    }
                    else{
                       row.attachment = {};
                    }
                });
                const data = {
                    id:rows[0].id,
                    created_ts:rows[0].created_ts,
                    updated_ts:rows[0].updated_ts,
                    owner_id:res.locals.owner_id,
                    vendor:rows[0].vendor,
                    bill_date:rows[0].bill_date,
                    due_date:rows[0].due_date,
                    amount_due: rows[0].amount_due,
                    categories: rows[0].categories.split(","),
                    payment_status:rows[0].payment_status,
                    attachment: rows[0].attachment
   
                }
               res.status(201).json(data);
             }
             else{
                res.status(400).json({message:"Cant return a bill"});  
             }

         }
             
         else{
            res.status(400).json();
         } 
     })
 };

 exports.getAllBills = (req, res) => {
    client.increment('get.bills');
    const sql = "SELECT *  FROM `bill` WHERE `owner_id`='"+res.locals.owner_id+"'";
    var startTimeOfQuery = new Date();
    mysqlConnection.query(sql,
    (err, rows, fields) => {
        if (!err){
            rows.forEach( row => row.categories = row.categories.split(",") );
            rows.forEach(row => delete row.id_auto);
            rows.forEach(row => {
                if(row.attachment!=null){
                    row.attachment=  JSON.parse(row.attachment);
                }
                else{
                   row.attachment = {};
                }
            });
            var endTimeOfQuery =new Date();
            var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
            client.timing('get.bills.DBtime',milliSecondsOfAPICall);
            res.status(200).json(rows);
        }     
        else{
            res.status(400).json({message:"Error Occurred"});
        }
    })
    client.timing('get.bills.APItime',61);
}
exports.checkBill = (req, res,next) => {
   const id = req.params.id;
   const sql = "SELECT *  FROM `bill` WHERE `id`='"+id+"'";
   mysqlConnection.query(sql,(err, rows,fields) => {
    if (rows && rows.length)
    {   
        if(rows[0].owner_id!=res.locals.owner_id){
            logger.error("User not authorized to access bill");
            res.status(401).json({message:"Unauthorized"}); 
        }
        else{
            res.locals.result = rows[0];
            next();
        }
    }    
    else{
        logger.error("Bill Not found!");
        res.status(404).json({message:"Not Found"});
    }
        
})

}
exports.getBill = (req, res) => {
   const id = req.params.id;
   const sql = "SELECT *  FROM `bill` WHERE `id`='"+id+"'";
   client.increment('get.bill.id');
   var startTimeOfQuery = new Date();
   mysqlConnection.query(sql,(err, rows,fields) => {
        rows.forEach( row => row.categories = row.categories.split(",") );
        rows.forEach(row => delete row.id_auto);
        rows.forEach(row => {
            if(row.attachment!=null){
                row.attachment = JSON.parse(row.attachment);
            }
            else{
               row.attachment = {};
            }
        });
        var endTimeOfQuery =new Date();
        var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
        client.timing('get.bill.id.DBtime',milliSecondsOfAPICall);
        logger.info("get.bill success :Bill details accessed!");
        res.status(200).json(rows[0]); 
    });
    client.timing('get.bill.id.APItime',61);
}
exports.updateBill = (req, res,next) => {
    client.increment('put.bill');
    const updatedDate = new Date().toISOString();
    var sqlUpdate =  "UPDATE bill set vendor =? , bill_date =?,due_date=?,amount_due=?,categories=?,payment_status=?,updated_ts=? WHERE id = ?";
    var startTimeOfQuery = new Date();
    mysqlConnection.query(sqlUpdate, [req.body.vendor,req.body.bill_date,req.body.due_date,req.body.amount_due,req.body.categories,req.body.payment_status,updatedDate,req.params.id], (err, rows, fields) => {
        if (!err){
            logger.info("put.bill success :Bill details accessed!");
            next();
        }   
        else
            res.status(400).json();
    });
    var endTimeOfQuery =new Date();
    var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
    client.timing('put.bill.DBtime',milliSecondsOfAPICall);
    client.timing('put.bill.APItime',167);
 }
 exports.deleteBill = (req, res,next) => {
    client.increment('delete.bill');
    var sql = "DELETE FROM `bill` WHERE `id`=?";
    var startTimeOfQuery = new Date();
    mysqlConnection.query(sql, [req.params.id], (err, rows, fields) => {
        if (!err){
            var endTimeOfQuery =new Date();
            var milliSecondsOfAPICall = (endTimeOfQuery.getTime() - startTimeOfQuery.getTime());
            client.timing('delete.bill.DBtime',milliSecondsOfAPICall);
            next();
        }   
        else
            res.status(400).json({message:"delete failed"});
    });
    client.timing('delete.bill.APItime',79);
    
 }
 exports.deleteFile = (req, res,next) => {
    if(res.locals.result.attachment==null){
        logger.info("delete.bill success :Bill details deleted!");
        res.status(204).json({message:"Deleted Successfully"});
    }
    else{
        const attachment = JSON.parse(res.locals.result.attachment);
        const fileId = attachment.id;
        // fs.unlink('./'+attachment.url, function (err) {
        //     if (err) throw err;
        // });
        AWS.config.update({
            secretAccessKey: 'RAtmqNZWShzyqUSuh4BBSUV3jJHWsYul+zERkwDQ',
        accessKeyId: 'AKIA5TE7USCPB4JXLMXX',
        });
        var bucketInstance = new AWS.S3();
            var params = {
                Bucket: process.env.s3_bucket_name,
                Key: attachment.file_name
            };
            bucketInstance.deleteObject(params, function (err, data) {
                if (err){
                    res.status(404).json({message:" attachment not deleted on s3 bucket"})
                }
            });   
        const sql = "DELETE FROM `metaFile` WHERE `id`=?";;
        mysqlConnection.query(sql,[fileId],(err, rows,fields) => {
        if (!err){   
            const sqlMetaFileDelete = "DELETE FROM `file` WHERE `id`=?";
            mysqlConnection.query(sqlMetaFileDelete,[fileId],(err, rows,fields) => {
                if (!err){ 
                    logger.info("delete.bill success :Bill details deleted!");  
                    res.status(204).json({message:"Deleted successfully"}); 
                }
                else{
                    res.status(404).json({message:"mysql delte file error"});   
            } 
            })
        }
        else{
                res.status(404).json({message:"mysql delete metafile error"});   
        }    
         
})

    }
};
 exports.checkUserForError = (req, res, next) => {
    var user = basicAuth(req);
    if(user && (!user.name ||!user.pass)){
        logger.error("Authorization headers i.e. user details  missing for bill");
        return res.status(404).json({message:"Authorization headers missing"});
    }
    const sql = "SELECT id,firstName,password, lastName, email,accountCreated,accountUpdated FROM `users` WHERE `email`='"+user.name+"'";
    mysqlConnection.query(sql, 
        (err, rows, fields) => {
            if (!err){
                if(rows && rows.length && bcrypt.compareSync(user.pass,rows[0].password)){
                    res.locals.owner_id = rows[0].id;
                    next();
                }
                else{
                logger.error("User does not exist");
                  res.status(404).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(404).json({message:"failed"});
            }
                
        })
   };
