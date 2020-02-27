const basicAuth = require('basic-auth');
const bcrypt = require('bcrypt');
var fs = require('fs');
const AWS = require('aws-sdk');// Lets us interact with the aws services
const multerS3 = require('multer-s3');// Lets us interact with the S3 Bucket for multipart forms upload
const mysqlConnection= require('../db/db');
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
        res.status(400).json({message:"file format wrong"});
    }
};
exports.insertFile = (req, res,next) => {
    try {
        const image = req.file;
        // make sure file is available
        if (!image) {
            res.status(400).json({
                message: 'No file is selected.'
            });
        } 
        else {
            const id = req.params.id;
            const date = new Date().toISOString();
            const upload_date = date.substring(0,10);
            const file_name = req.file.filename;
            const url = req.file.path;
            const attachment = {
                file_name,
                id,
                url,
                upload_date
            }
           var sqlUpdate =  `UPDATE bill set attachment =? WHERE id = ?`; 
            mysqlConnection.query(sqlUpdate,['{"file_name":'+ '"'+ file_name +'"'+',"id":'+ '"'+ id +'"'+ ',"url":'+ '"'+ url +'"'+ ',"upload_date":'+ '"'+ upload_date +'"'+ '}',req.params.id], (err, rows, fields) => {
                if (!err){
                    var sqlInsert= "INSERT INTO `file`(`file_name`,`id`,`url`,`upload_date`) VALUES ('" + file_name +"','"+ id + "','" + url + "','" + upload_date + "')";
                    mysqlConnection.query(sqlInsert, (err, result) => {
                        if (!err)
                        {  
                            var sqlInsertmeta= "INSERT INTO `metaFile`(`field_name`,`original_name`,`encoding`,`mimetype`,`destination`,`file_name`,`path`,`size`,`id`) VALUES ('" + req.file.fieldname+"','"+ req.file.originalname + "','" + req.file.encoding + "','" + req.file.mimetype  + "','" + req.file.destination  + "','" + req.file.filename + "','" + req.file.path  + "','" + req.file.size  + "','" + id+ "')";
                            mysqlConnection.query(sqlInsertmeta, (err, result) => {
                                if (!err)
                                {  
                                    res.status(201).json(attachment);
                                }
                                    
                                else{
                                    res.status(400).json({message:"Failed inserting metafile Details"});

                                }
                            })
                        }
                            
                        else{
                            res.status(400).json({message:"Failed inserting a file"});
                        }
                  })
                    
                }   
                else{
                    res.status(400).json({message:"Sql query failed"});

                }
            }) 
        }

    } 
    catch (err) {
        res.status(400).json({message:"error in key"});
    } 
};
exports.checkUserForError = (req, res, next) => {
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
             res.status(401).json({message:"Unauthorized"}); 
         }
         else{
            if(rows[0].attachment==null){
                res.status(404).json({message:"bill does not have an attachment"});
            }
            else if(rows[0].attachment!=null && JSON.parse(rows[0].attachment).id!=req.params.fileId){
                res.status(400).json({message:"File id does not belong to this bill"});
            }
            else{
                next();
            }
         }
     }    
     else{
         res.status(404).json({message:" ID Not Found"});
     }
         
    })
};
exports.getFile = (req, res,next) => {
    const fileId = req.params.fileId;
    const sql = "SELECT *  FROM `file` WHERE `id`='"+fileId+"'";
    mysqlConnection.query(sql,(err, rows,fields) => {
     if (rows && rows.length){   
             res.status(200).json(rows[0]); 
     }
         else{
            res.status(404).json({message:" ID Not Found"});   
    }    
         
})
};
exports.deleteAttachment = (req, res,next) => {
    const id = req.params.id;
    var sqlUpdate =  `UPDATE bill set attachment =? WHERE id = ?`; 
            mysqlConnection.query(sqlUpdate,[null,req.params.id], (err, rows, fields) => {
                if (!err){
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
            var params = {
                Bucket: process.env.s3_bucket_name,
                Key: rows[0].file_name
            };
            bucketInstance.deleteObject(params, function (err, data) {
                if (data) {
                    next();
                }
                else {
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
    const sql = "DELETE FROM `metaFile` WHERE `id`=?";;
    mysqlConnection.query(sql,[fileId],(err, rows,fields) => {
     if (!err){   
        const sqlMetaFileDelete = "DELETE FROM `file` WHERE `id`=?";
        mysqlConnection.query(sqlMetaFileDelete,[fileId],(err, rows,fields) => {
            if (!err){   
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
};