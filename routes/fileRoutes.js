var multer = require('multer');
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/')
    },
    filename: (req, file, cb) => {
        const name = file.originalname.split(".");
        cb(null, name[0] + req.params.id +'.' + name[1]);
    }
});
const fileFilter = (req, file, cb) => {
        const extension = file.mimetype && file.mimetype.split("/")[1]? file.mimetype.split("/")[1].toLowerCase():"";
        if(extension =="jpeg" || extension =="pdf" || extension == "jpg" || extension =="png"){
            cb(null, true);
        }
        else{
           return cb(null,false)
        }
  };
var upload = multer({storage:storage,fileFilter:fileFilter}).single('image');
router.route('/:id/file/').
post(fileController.checkUser,fileController.checkBillId,(req,res,next)=>{
    upload(req, res, function(err) {
         if (err instanceof multer.MulterError) {
            return res.status(400).send({message:"Error in uploading files"});
        }
        else if (err) {
            return res.status(400).send({message:"error in uploading files"});
        }
        else{
            next();
        }
    })

},fileController.checkExtension,fileController.insertFile);
 router
.route('/:id/file/:fileId')
   .get(fileController.checkUserForError,fileController.checkBillIDs,fileController.getFile)
   .delete(fileController.checkUserForError,fileController.checkBillIDs,fileController.deleteAttachment,fileController.deleteFileOnSystem,fileController.deleteFile)
module.exports = router;