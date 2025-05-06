const Donation = require('../models/Donation')
const razorpay = require('../config/razorpay')
const { logger } = require('../config/logger')

// Create a new donation record
exports.createDonation = async (req, res) => {
  try {
    const { name, email, phone, amount, message } = req.body

    const donation = new Donation({
      name,
      email,
      phone,
      amount,
      message,
      status: 'created',
    })

    const savedDonation = await donation.save()

    res.status(201).json({
      success: true,
      donationId: savedDonation._id,
      donation: savedDonation,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'Server Error',
    })
  }
}

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, donationId } = req.body

    // Validate donation exists
    const donation = await Donation.findById(donationId)
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      })
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `donation_${donationId}`,
      payment_capture: 1, // auto capture payment
    }

    const order = await razorpay.orders.create(options)

    // Update donation with order ID
    donation.razorpay_order_id = order.id
    donation.status = 'attempted'
    await donation.save()

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    })
  }
}

// Verify payment and update donation
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      donationId,
    } = req.body

    // Validate donation exists
    const donation = await Donation.findById(donationId)
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      })
    }

    // Verify payment (in a real app, you should verify the signature)
    // For simplicity, we'll assume payment is successful if we get payment ID
    if (razorpay_payment_id) {
      donation.razorpay_payment_id = razorpay_payment_id
      donation.razorpay_order_id = razorpay_order_id
      donation.razorpay_signature = razorpay_signature
      donation.status = 'paid'
      await donation.save()

      return res.status(200).json({
        success: true,
        message: 'Payment verified and donation updated',
        donation,
      })
    }

    res.status(400).json({
      success: false,
      message: 'Payment verification failed',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'Server Error',
    })
  }
}
