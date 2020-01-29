const basicAuth = require('basic-auth');
const bcrypt = require('bcrypt');
const { fromString } = require('uuidv4');
const mysqlConnection= require('../db/db');
exports.checkBody = (req, res, next) => {
    if(req.body.vendor==undefined || req.body.bill_date==undefined || req.body.due_date==undefined || req.body.amount_due==undefined || req.body.payment_status==undefined || isNaN(req.body.amount_due)|| req.body.amount_due<0.01){
        return  res.status(400).json({message:"Fields Missing"});
     }
     next();
   };
exports.setId = (req, res, next) => {
    const sql = "SELECT id FROM `bill`";
    mysqlConnection.query(sql,
        (err, rows, fields) => {
            if (!err){
                res.locals.billsLength = rows.length.toString();
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
                  res.status(400).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(400).json({message:"failed"});
            }
                
        })
   };

   exports.createBill =(req, res,next) => {
    const data = req.body;
    const owner_id = res.locals.owner_id;
    const vendor = data.vendor;
    const bill_date = data.bill_date;
    const due_date = data.due_date;
    const amount_due =  data.amount_due;
    const categories = data.categories;
    const payment_status = data.payment_status;
    const id =fromString(res.locals.billsLength + 1);
    const createdDate = new Date().toISOString();
    var sql = "INSERT INTO `bill`(`id`,`created_ts`,`updated_ts`,`owner_id`,`vendor`, `bill_date`,`due_date`,`amount_due`,`categories`,`payment_status`) VALUES ('" + id +"','"+ createdDate + "','" + createdDate + "','" + owner_id + "','" + vendor + "','" + bill_date + "','" + due_date + "','" + amount_due + "','" + categories+ "','" + payment_status + "')";
    mysqlConnection.query(sql, (err, result) => {
        if (!err)
        {  
           res.locals.id = id;
           next();
        }
            
        else
            res.status(400).json({message:"Failed inserting a bill"});
    })
};

exports.returnBill =(req, res) => {
    const sql = "SELECT id,created_ts,updated_ts,owner_id,vendor,bill_date,due_date,amount_due,categories,payment_status FROM `bill` WHERE `id`='"+res.locals.id+"'";
     mysqlConnection.query(sql, 
     (err, rows, fields) => {
         if (!err){
             if(rows && rows.length){
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
                    payment_status:rows[0].payment_status
   
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
    //console.log(res.locals.owner_id);
    const sql = "SELECT *  FROM `bill` WHERE `owner_id`='"+res.locals.owner_id+"'";
    mysqlConnection.query(sql,
    (err, rows, fields) => {
        if (!err){
            rows.forEach( row => row.categories = row.categories.split(",") );
            res.status(200).json(rows);
        }     
        else{
            res.status(400).json({message:"Error Occurred"});
        }
    })
}
exports.checkBill = (req, res,next) => {
   console.log(req.params.id);
   const id = req.params.id;
   const sql = "SELECT *  FROM `bill` WHERE `id`='"+id+"'";
   mysqlConnection.query(sql,(err, rows,fields) => {
    if (rows && rows.length)
    {   
        if(rows[0].owner_id!=res.locals.owner_id){
            res.status(401).json({message:"Unauthorized"}); 
        }
        else{
            res.locals.result = rows[0];
            next();
        }
    }    
    else{
        res.status(404).json({message:"Not Found"});
    }
        
})

}
exports.getBill = (req, res) => {
   const id = req.params.id;
   const sql = "SELECT *  FROM `bill` WHERE `id`='"+id+"'";
   mysqlConnection.query(sql,(err, rows,fields) => {
         rows.forEach( row => row.categories = row.categories.split(",") );
          res.status(200).json(rows[0]);
    
 })
}
exports.updateBill = (req, res,next) => {
    const updatedDate = new Date().toISOString();
    var sqlUpdate =  "UPDATE bill set vendor =? , bill_date =?,due_date=?,amount_due=?,categories=?,payment_status=?,updated_ts=? WHERE id = ?";
    mysqlConnection.query(sqlUpdate, [req.body.vendor,req.body.bill_date,req.body.due_date,req.body.amount_due,req.body.categories,req.body.payment_status,updatedDate,req.params.id], (err, rows, fields) => {
        if (!err){
            next();
        }   
        else
            res.status(400).json();
    })
 }
 exports.deleteBill = (req, res,next) => {
    var sql = "DELETE FROM `bill` WHERE `id`=?";
    mysqlConnection.query(sql, [req.params.id], (err, rows, fields) => {
        if (!err){
            res.status(204).json({message:"Deleted Successfully"});
        }   
        else
            res.status(400).json({message:"delete failed"});
    })
 }
 exports.checkUserForError = (req, res, next) => {
    var user = basicAuth(req);
    if(user && (!user.name ||!user.pass)){
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
                  res.status(404).json({message:"User does not exist"});  
                }
   
            }
            else{
                res.status(404).json({message:"failed"});
            }
                
        })
   };
