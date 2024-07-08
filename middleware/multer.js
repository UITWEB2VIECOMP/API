const multer = require('multer')
const path = require('path');

const uploadImg = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5000000 },
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
        cb("error: must be img")
    }
}
module.exports={uploadImg}