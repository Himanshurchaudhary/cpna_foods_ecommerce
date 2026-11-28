const Coupon = require('../models/Coupon');
const {
  CheckoutError,
  buildOrderItems,
  getCouponDiscount,
} = require('../services/checkoutService');

// @desc Add New Promo Code
exports.addCoupon = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.couponCode) {
      return res.status(400).json({ success: false, error: 'Coupon code is required.' });
    }
    data.couponCode = String(data.couponCode).trim().toUpperCase();

    if (data.category) {
      data.category_id = Number(data.category);
    }
    delete data.category;

    if (data.applicableFor !== 'Category_Specific') {
      data.category_id = null;
    }

    const coupon = await Coupon.create(data);
    res.status(201).json({ success: true, message: 'Promo Code Created!', coupon });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Coupon code already exists.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get All Coupons (admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Update a Coupon
exports.updateCoupon = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.couponCode) {
      updateData.couponCode = String(updateData.couponCode).trim().toUpperCase();
    }

    if ('category' in updateData) {
      updateData.category_id = updateData.category ? Number(updateData.category) : null;
      delete updateData.category;
    }

    if (updateData.applicableFor && updateData.applicableFor !== 'Category_Specific') {
      updateData.category_id = null;
    }

    // null is allowed here, so empty fields really get cleared
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({ success: true, message: 'Promo Code Updated!', coupon });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Coupon code already exists.' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Delete a Coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, message: 'Promo Code Deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Toggle Coupon Active Status
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.toggleStatus(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}!`,
      coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Validate Coupon at checkout (same rules as the order)
// Body: { code, buyNow?, productId?, quantity?, variantId? }
exports.validateCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || '').trim();
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const items = await buildOrderItems({ userId: req.user.id, body: req.body });
    const subtotal = items.reduce((s, i) => s + i.total, 0);

    const couponDiscount = await getCouponDiscount({
      userId: req.user.id,
      couponCode: code,
      subtotal,
      items,
    });

    const coupon = await Coupon.findOne({ couponCode: code.toUpperCase() });

    res.status(200).json({ success: true, coupon, couponDiscount });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};