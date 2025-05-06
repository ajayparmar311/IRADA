const express = require('express')
const router = express.Router()
const donationController = require('../controllers/donationController')

// Create donation record
router.post('/donate', donationController.createDonation)

// Create Razorpay order
router.post('/donate/pay', donationController.createRazorpayOrder)

// Verify payment
router.post('/donate/pay/verify', donationController.verifyPayment)

module.exports = router
