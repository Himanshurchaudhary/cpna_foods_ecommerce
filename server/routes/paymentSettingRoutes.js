const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary');
const {
    getAllGatewaySettings,
    addPaymentSettings,
    updatePaymentSettings,
    toggleGatewayStatus,
    getActiveGateways,
    createStripeIntent,
} = require('../controllers/dependenceController/paymentSettingController');
const { protect } = require('../middleware/authMiddleware');

// Admin: manage gateways
router.get('/all',                   protect, getAllGatewaySettings);
router.post('/add',                  protect, upload.single('logo'), addPaymentSettings);
router.post('/update',               protect, upload.single('logo'), updatePaymentSettings);
router.patch('/toggle/:gatewayName', protect, toggleGatewayStatus);

// Public: active gateways for checkout
router.get('/active', getActiveGateways);

// User: card payment
router.post('/stripe/intent', protect, createStripeIntent);

module.exports = router;