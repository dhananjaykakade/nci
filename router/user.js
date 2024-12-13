const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../utils/multer");



router.get("/user",userController.getUserDetails)
router.get("/healthCheck",userController.healthCheck)
router.post("/register",upload.single('Image'),userController.Register)

module.exports = router;