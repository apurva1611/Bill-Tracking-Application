const de =require('dotenv').config();
const basicAuth = require('basic-auth');
const bcrypt = require('bcrypt');
var fs = require('fs');
const AWS = require('aws-sdk');// Lets us interact with the aws services
const multerS3 = require('multer-s3');// Lets us interact with the S3 Bucket for multipart forms upload
const mysqlConnection= require('../db/db');
const client = require('../services/stastDClientConnect');
const logger = require('../logsConfig');
exports.checkUser = (req, res, next) => {
    var user = basicAuth(req);
    if(user && (!user.name ||!user.pass)){
        return res.status(400).json({message:"Authorization headers missing"});
    }
    const sql = "SELECT id,password FROM `users` WHERE `email`='"+user.name+"'";
    mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err){
                if(rows && rows.length && bcrypt.compareSync(user.pass,rows[0].password)){
                    res.locals.owner_id = rows[0].id;
                    next();
                }
                else{
                  res.status(400).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(400).json({message:" Request failed"});
            }
                
    })
};

exports.checkBillId = (req, res,next) => {
    const billId = req.params.id;
    const sql = "SELECT *  FROM `bill` WHERE `id`='"+billId+"'";
    mysqlConnection.query(sql,(err, rows,fields) => {
     if (rows && rows.length){   
         if(rows[0].owner_id!=res.locals.owner_id){
             res.status(404).json({message:"Unauthorized"}); 
         }
         else{
             if(rows[0].attachment!=null){
                res.status(400).json({message:"bill already has a file attached"});  
             }
             else{
                res.locals.result = rows[0];
                next();
             }
         }
     }    
     else{
         res.status(400).json({message:" ID Not Found"});
     }
         
    })
};

exports.checkExtension = (req, res,next) => {
    const extension = req.file && req.file.mimetype && req.file.mimetype.split("/")[1]? req.file.mimetype.split("/")[1].toLowerCase():"";
    if(extension =="jpeg" || extension =="pdf" || extension == "jpg" || extension =="png"){
        next();
    }
    else{
        logger.error("post.file error : file format wrong of uploaded file!");
        res.status(400).json({message:"file format wrong"});
    }
};
exports.insertFile = (req, res,next) => {
    const startTime = new Date();
    client.increment('post.file');
    try {
        const image = req.file;
        // make sure file is available
        if (!image) {
            res.status(400).json({
                message: 'No file is selected.'
            });
            logger.error("post.file error : No file is selected!");
        } 
        else {
            const id = req.params.id;
            const date = new Date().toISOString();
            const upload_date = date.substring(0,10);
            const file_name = req.file.key;
            const url = req.file.path;
            const attachment = {
                file_name,
                id,
                url,
                upload_date
            }
            console.log(file_name);
           var sqlUpdate =  `UPDATE bill set attachment =? WHERE id = ?`;
           var startTimeAttachment = new Date();
            mysqlConnection.query(sqlUpdate,['{"file_name":'+ '"'+ file_name +'"'+',"id":'+ '"'+ id +'"'+ ',"url":'+ '"'+ url +'"'+ ',"upload_date":'+ '"'+ upload_date +'"'+ '}',req.params.id], (err, rows, fields) => {
                if (!err){
                    var endTimeAttachment =new Date();
                    var milliSecondsOfAPICall1 = (endTimeAttachment.getTime() - startTimeAttachment.getTime());
                    client.timing('post.file.update.user.attachment.DBtime',milliSecondsOfAPICall1);
                    var sqlInsert= "INSERT INTO `file`(`file_name`,`id`,`url`,`upload_date`) VALUES ('" + file_name +"','"+ id + "','" + url + "','" + upload_date + "')";
                    var startTimeFile = new Date();
                    mysqlConnection.query(sqlInsert, (err, result) => {
                        if (!err)
                        {   
                            var endTimeFile =new Date();
                            var milliSecondsOfAPICall2 = (endTimeFile.getTime() - startTimeFile.getTime());
                            client.timing('post.file.DBtime',milliSecondsOfAPICall2);
                            var sqlInsertmeta= "INSERT INTO `metaFile`(`field_name`,`original_name`,`encoding`,`mimetype`,`destination`,`file_name`,`path`,`size`,`id`) VALUES ('" + req.file.fieldname+"','"+ req.file.originalname + "','" + req.file.encoding + "','" + req.file.mimetype  + "','" + req.file.destination  + "','" + req.file.key + "','" + req.file.path  + "','" + req.file.size  + "','" + id+ "')";
                            var startTimemetaFile = new Date();
                            mysqlConnection.query(sqlInsertmeta, (err, result) => {
                                if (!err)
                                {   var endTimemetaFile = new Date();
                                    var milliSecondsOfAPICall3 = (endTimemetaFile.getTime() - startTimemetaFile.getTime());
                                    client.timing('post.metaFile.DBtime',milliSecondsOfAPICall3);
                                    logger.info("post.file successs");
                                    res.status(201).json(attachment);
                                }
                                    
                                else{
                                    logger.error("post.file error: Failed inserting metafile Details");
                                    res.status(400).json({message:"Failed inserting metafile Details"});

                                }
                            })
                        }
                            
                        else{
                            logger.error("post.file error: Failed inserting file Details");
                            res.status(400).json({message:"Failed inserting a file"});
                        }
                  })
                    
                }   
                else{
                    logger.error("post.file error: sql query failed");
                    res.status(400).json({message:"Sql query failed"});

                }
            }) 
        }

    } 
    catch (err) {
        res.status(400).json({message:"error in key"});
    } 
    var endTime =new Date();
    var milliSecondsOfAPICall = (endTime.getTime() - startTime.getTime());
    client.timing('post.file.APItime',milliSecondsOfAPICall);
};
exports.checkUserForError = (req, res, next) => {
    var user = basicAuth(req);
    if(user && (!user.name ||!user.pass)){
        logger.error("Authorization details  missing of user for file API");
        return res.status(400).json({message:"Authorization headers missing"});
    }
    const sql = "SELECT id,password FROM `users` WHERE `email`='"+user.name+"'";
    mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err){
                if(rows && rows.length && bcrypt.compareSync(user.pass,rows[0].password)){
                    res.locals.owner_id = rows[0].id;
                    next();
                }
                else{
                    logger.error("File API call :User does not exist ");
                  res.status(404).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(404).json({message:" Request failed"});
            }
                
    })
};
exports.checkBillIDs = (req, res,next) => {
    const billId = req.params.id;
    const sql = "SELECT *  FROM `bill` WHERE `id`='"+billId+"'";
    mysqlConnection.query(sql,(err, rows,fields) => {
     if (rows && rows.length){   
         if(rows[0].owner_id!=res.locals.owner_id){
            logger.error("File API call :User not authorized to access bill");
             res.status(401).json({message:"Unauthorized"}); 
         }
         else{
            if(rows[0].attachment==null){
                logger.error("File API call :bill does not have an attachment");
                res.status(404).json({message:"bill does not have an attachment"});
            }
            else if(rows[0].attachment!=null && JSON.parse(rows[0].attachment).id!=req.params.fileId){
                logger.error("File API call :File id does not belong to bill");
                res.status(400).json({message:"File id does not belong to this bill"});
            }
            else{
                next();
            }
         }
     }    
     else{
        logger.error("File API call :Bill ID does not exist");
         res.status(404).json({message:" ID Not Found"});
     }
         
    })
};
exports.getFile = (req, res,next) => {
    const startTime = new Date();
    const fileId = req.params.fileId;
    client.increment('get.file');
    const sql = "SELECT *  FROM `file` WHERE `id`='"+fileId+"'";
    var startTimeFile =new Date();
    mysqlConnection.query(sql,(err, rows,fields) => {
     if (rows && rows.length){ 
        var endTimeFile =new Date();
        var milliSecondsOfAPICall = (endTimeFile.getTime() - startTimeFile.getTime());
        client.timing('get.file.DBtime',milliSecondsOfAPICall);
        client.timing('get.file.APItime',127);
        logger.info("Get.file API call Success"); 
        res.status(200).json(rows[0]); 
     }
         else{
            logger.error("Get File API call :File id does not exist");
            res.status(404).json({message:" ID Not Found"});   
    }  
         
})
    var endTime =new Date();
    var milliSecondsOfAPICall = (endTime.getTime() - startTime.getTime());
    client.timing('post.file.APItime',milliSecondsOfAPICall);
};
exports.deleteAttachment = (req, res,next) => {
    const id = req.params.id;
    var sqlUpdate =  `UPDATE bill set attachment =? WHERE id = ?`;
            var startTimeFile = new Date();
            mysqlConnection.query(sqlUpdate,[null,req.params.id], (err, rows, fields) => {
                if (!err){
                    var endTimeFile =new Date();
                    var milliSecondsOfAPICall2 = (endTimeFile.getTime() - startTimeFile.getTime());
                    client.timing('delete.file.update.user.attachment.DBtime',milliSecondsOfAPICall2);
                    next();
                }
                else{
                    res.status(404).json({message:" Attachment not deleted"}); 
                }  
            });                      
};
exports.deleteFileOnSystem = (req, res,next) => {
    const fileId = req.params.fileId;
    const sql = "SELECT *  FROM `file` WHERE `id`='"+fileId+"'";
    mysqlConnection.query(sql,[null,fileId], (err, rows, fields) => {
        if (!err){
        //     fs.unlink('./'+rows[0].url, function (err) {
        //         if (err) throw err;
        //         next();
        //     }); 
            var bucketInstance = new AWS.S3();
            var imageName = (rows[0].file_name).replace('https://s3.amazonaws.com/'+process.env.s3_bucket_name +'/', '');
            var params = {
                Bucket: process.env.s3_bucket_name,
                Key: rows[0].file_name
            };
            var startTimeBucket = new Date();
            bucketInstance.deleteObject(params, function (err, data) {
                if (data) {
                    var endTimeBucket =new Date();
                    var milliSecondsOfAPICall1 = (endTimeBucket.getTime() - startTimeBucket.getTime());
                    logger.info("deleted file on s3 bucket!");
                    client.timing('delete.File.S3BucketCall',milliSecondsOfAPICall1);
                    next();
                }
                else {
                    logger.error("attachment not deleted on s3 bucket");
                    res.status(404).json({message:" attachment not deleted on s3 bucket"})
                }
            });         
        }
        else{
                res.status(404).json({message:" attachment not deleted on system"}); 
        }  
    });  
};

exports.deleteFile = (req, res,next) => {
    const fileId = req.params.fileId;
    client.increment('delete.file');
    const sql = "DELETE FROM `metaFile` WHERE `id`=?";
    var startTimeMetaFile = new Date();
    mysqlConnection.query(sql,[fileId],(err, rows,fields) => {
     if (!err){ 
        var endTimeMetaFile =new Date();
        var milliSecondsOfAPICall1 = (endTimeMetaFile.getTime() - startTimeMetaFile.getTime());
        client.timing('delete.metaFile.DBtime',milliSecondsOfAPICall1);   
        res.status(200).json(rows[0]);  
        const sqlMetaFileDelete = "DELETE FROM `file` WHERE `id`=?";
        var startTimeFile = new Date();
        mysqlConnection.query(sqlMetaFileDelete,[fileId],(err, rows,fields) => {
            if (!err){
                var endTimeFile =new Date();
                var milliSecondsOfAPICall2 = (endTimeFile.getTime() - startTimeFile.getTime());
                client.timing('delete.File.DBtime',milliSecondsOfAPICall2);
                logger.info("delete file API call success");
                res.status(204).json({message:"Deleted successfully"}); 
            }
            else{   
                logger.error("delete file APi call: mysql delte file error");
                   res.status(404).json({message:"mysql delte file error"});   
           } 
        })
    }
    else{
        logger.error("delete file APi call: mysql delte metafile error");
            res.status(404).json({message:"mysql delete metafile error"});   
    }
    client.timing('delete.file.APItime',167);
         
})
};