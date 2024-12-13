const express = require("express");
const router = express.Router();
const adminController= require("../controllers/adminController")
const protectRoute = require('../middleware/authMiddleware');

router.post('/admin-login', adminController.adminLogin)
router.get('/admin',protectRoute(['admin']), adminController.adminTest)
router.get('/count', adminController.getEventCounts)
router.get('/amount', adminController.getAmount)
router.get('/user-count', adminController.getTotalUserCount)
router.get('/users', adminController.getAllUsers)
router.post('/sendMail',adminController.sendConfirmationEmail)







module.exports = router;