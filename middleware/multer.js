const multer = require('multer')
const path = require('path');

const uploadImg = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5000000, files:1 },
    fileFilter: async function(req, file, cb){
        CheckImage(file, cb)
    }
}).single('file');

const CheckImage=(file, cb)=>{
    const filetypes = /jpeg|jpg|png|gif/;
    const extName = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimeType = filetypes.test(file.mimetype)
    if(extName &&mimeType){
        return cb(null, true)
    }else{
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
    }
}
const uploadFiles = multer({
    storage:  multer.memoryStorage(),
    limits: { fileSize: 50000000, files: 10 }, 
    fileFilter: function (req, file, cb) {
        cb(null, true);
    }
}).any();

const multerErrorHandling=(error, req, res, next)=>{
    if(error instanceof multer.MulterError){
        if (error.code === "LIMIT_FILE_SIZE"){
            return res.status(401).json({status: "error", message:"file is too large(>5mb))"})
        }
        if(error.code === "LIMIT_FILE_COUNT"){
            return res.status(401).json({status:"error", message:"File limit reached"})
        }
        if(error.code === "LIMIT_UNEXPECTED_FILE"){
            return res.status(401).json({status:"error", message:"Wrong file type"})
        }
        
    }
}
module.exports={uploadImg, multerErrorHandling, uploadFiles}