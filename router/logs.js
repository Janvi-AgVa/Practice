const express = require("express");
const multer = require("multer");
const { body } = require('express-validator');
var maxSize = 1 * 1024 * 1024
// FILE UPLOAD WITH MULTER 
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
  var upload = multer({ storage: storage, limits: { fileSize: maxSize } });
var uploadFunc = upload.single("filePath")
const router = express.Router();
const {
    createLogsV2
}=require("../controller/logs");

const { isAuth } = require("../middleware/authMiddleware");
const {validateHeader } = require("../middleware/validateMiddleware");

router.post(
  "/v2/:project_code",
  function (req, res, next) {
    uploadFunc(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: err.stack,
              msg: err.message,
              type: err.name,
            },
          },
        });
      } else if (err) {
        console.log(err)
        // An unknown error occurred when uploading.
        return res.status(500).json({
          status: -1,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: err.stack,
              msg: err.message,
              type: err.name,
            },
          },
        });
      }
      // Everything went fine.
      next()
    })
  },
  validateHeader,
  createLogsV2
);

module.exports = router;
