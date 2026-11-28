const Stripe = require('stripe');
const { pool } = require('../config/db');
const Cart = require('../models/User/Cart');
const Product = require('../models/product_Management/Product');
const Order = require('../models/Order');
const PaymentSetting = require('../models/dependence/PaymentSetting');
const Coupon = require('../models/Coupon');
const DeliveryCharge = require('../models/DeliveryCharge');
const Tax = require('../models/Tax');

// ─── Errors & helpers ─────────────────────────────────────────────────────────
class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const toMinor = (aed) => Math.round(Number(aed) * 100); // AED to fils

// ─── coupon_usages table (for limitPerUser) ───────────────────────────────────
const createCouponUsageTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupon_usages (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      couponId   INT NOT NULL,
      userId     INT NOT NULL,
      orderId    INT NULL,
      createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_coupon_user (couponId, userId),
      FOREIGN KEY (couponId) REFERENCES coupons(id) ON DELETE CASCADE
    )
  `);
};
createCouponUsageTable().catch((err) =>
  console.error('coupon_usages table init failed:', err)
);

// ─── Order items (buy-now or cart) ────────────────────────────────────────────
const buildOrderItems = async ({ userId, body = {} }) => {
  const { buyNow = false, productId = null, quantity = 1, variantId = null } = body;

  if (buyNow && productId) {
    const product = await Product.findById(productId);
    if (!product) throw new CheckoutError('Product not found', 404);

    const qty = Math.max(1, Number(quantity) || 1);
    let price = Number(product.sellingPrice ?? product.price ?? 0);
    let variantLabel = null;

    if (variantId) {
      const variant = (product.variants || []).find((v) => v.id == variantId);
      if (!variant) throw new CheckoutError('Selected variant not found', 400);
      price = Number(variant.sellingPrice ?? price);
      variantLabel = variant.label || null;
    }

    return [{
      product: product.id,
      name: product.name,
      image: product.thumbnail || product.image || null,
      price,
      quantity: qty,
      total: round2(price * qty),
      variantId: variantId || null,
      variantLabel,
      unit: product.unit ?? 'PCS',
    }];
  }

  const cart = await Cart.findByUser(userId);
  if (!cart?.items?.length) throw new CheckoutError('Your cart is empty', 400);

  return cart.items.map((item) => {
    const p = item.product;
    const hasVariant = !!item.variant;
    const price = hasVariant && item.variant.sellingPrice
      ? Number(item.variant.sellingPrice)
      : Number(p.sellingPrice ?? p.price ?? 0);
    const qty = item.quantity || 1;

    return {
      product: p.id,
      name: p.name,
      image: p.thumbnail || p.image || null,
      price,
      quantity: qty,
      total: round2(price * qty),
      variantId: item.variant?.id ?? null,
      variantLabel: item.variant?.label ?? null,
      unit: p.unit ?? 'PCS',
    };
  });
};

// ─── Coupon ───────────────────────────────────────────────────────────────────
// Used by both /api/coupon/validate (display) and order placement (final check).
const getCouponDiscount = async ({ userId, couponCode, subtotal, items = [] }) => {
  if (!couponCode) return 0;

  const coupon = await Coupon.findOne({
    couponCode: String(couponCode).trim().toUpperCase(),
    isActive: true,
  });
  if (!coupon) throw new CheckoutError('Invalid coupon code', 400);

  // Dates: start of start day, end of expiry day
  const now = new Date();
  const start = new Date(coupon.startDate);
  start.setHours(0, 0, 0, 0);
  if (now < start) throw new CheckoutError('Coupon is not active yet', 400);

  const expiry = new Date(coupon.expiryDate);
  expiry.setHours(23, 59, 59, 999);
  if (now > expiry) throw new CheckoutError('Coupon expired', 400);

  if (subtotal < Number(coupon.minOrderAmount)) {
    throw new CheckoutError(`Min order should be AED${coupon.minOrderAmount}`, 400);
  }

  // New users: only if the user has no previous orders
  if (coupon.applicableFor === 'New_User') {
    const previousOrders = await Order.find({ user_id: userId });
    if (previousOrders.length > 0) {
      throw new CheckoutError('This coupon is only for first-time orders', 400);
    }
  }

  // Per user limit
  const limit = Number(coupon.limitPerUser) || 0;
  if (limit > 0) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS used FROM coupon_usages WHERE couponId = ? AND userId = ?`,
      [coupon.id, userId]
    );
    if (Number(rows[0].used) >= limit) {
      throw new CheckoutError('You have already used this coupon', 400);
    }
  }

  // Category specific: only items of that category are discounted
  let eligibleSubtotal = subtotal;
  if (coupon.applicableFor === 'Category_Specific') {
    let eligible = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      // Confirm the category field name on your Product model (category_id or categoryId)
      const catId = product?.category_id ?? product?.categoryId;
      if (catId != null && Number(catId) === Number(coupon.category_id)) {
        eligible += item.total;
      }
    }
    if (eligible <= 0) {
      throw new CheckoutError('Coupon is not valid for items in your cart', 400);
    }
    eligibleSubtotal = round2(eligible);
  }

  const value = Number(coupon.discountValue);
  let discount;

  if (coupon.discountType === 'Percentage') {
    discount = (eligibleSubtotal * value) / 100;
    const cap = Number(coupon.maxDiscountAmount);
    if (cap > 0) discount = Math.min(discount, cap);
  } else {
    discount = value;
  }

  discount = Math.min(discount, eligibleSubtotal);
  return round2(Math.max(0, discount));
};

// Called after an order is saved, so limitPerUser counts real orders.
const recordCouponUsage = async ({ couponCode, userId, orderId }) => {
  if (!couponCode) return;
  const coupon = await Coupon.findOne({ couponCode: String(couponCode).toUpperCase() });
  if (!coupon) return;
  await pool.query(
    `INSERT INTO coupon_usages (couponId, userId, orderId) VALUES (?, ?, ?)`,
    [coupon.id, userId, orderId]
  );
};

// ─── Delivery ─────────────────────────────────────────────────────────────────
// Uses the subtotal before coupon discount, same as the checkout display.
// If no range matches, delivery is 0. Change this line if you want a different rule.
const getShippingCharge = async ({ subtotal }) => {
  const row = await DeliveryCharge.findForPrice(subtotal);
  return round2(row?.charge ?? 0);
};

// ─── Tax ──────────────────────────────────────────────────────────────────────
// Sum of all active taxes, applied on the amount after coupon discount.
const getTaxAmount = async ({ taxableAmount }) => {
  const taxes = await Tax.find({ isActive: true });
  const rate = taxes.reduce((sum, t) => sum + Number(t.percentage), 0);
  return round2((taxableAmount * rate) / 100);
};

// ─── Single source of truth for the order total ──────────────────────────────
const calculateOrderTotalOnServer = async ({ userId, body = {} }) => {
  const items = await buildOrderItems({ userId, body });

  const subtotal = round2(items.reduce((s, i) => s + i.total, 0));
  const couponDiscount = await getCouponDiscount({
    userId,
    couponCode: body.couponCode,
    subtotal,
    items,
  });
  const taxableAmount = round2(Math.max(0, subtotal - couponDiscount));
  const shippingCharge = await getShippingCharge({ subtotal });
  const tax = await getTaxAmount({ taxableAmount });
  const amount = round2(taxableAmount + shippingCharge + tax);

  return { items, subtotal, couponDiscount, taxableAmount, shippingCharge, tax, amount };
};

// ─── Verify a Stripe PaymentIntent before creating an order ──────────────────
const verifyStripeIntent = async ({ intentId, userId, amount }) => {
  if (!intentId) throw new CheckoutError('Missing payment reference', 400);

  const config = await PaymentSetting.findOne({ gatewayName: 'Stripe' });
  if (!config || !config.status) throw new CheckoutError('Card payment is not available', 400);

  const stripe = new Stripe(config.secretKey);
  const intent = await stripe.paymentIntents.retrieve(intentId);

  if (
    intent.status !== 'succeeded' ||
    intent.currency !== 'aed' ||
    intent.amount_received !== toMinor(amount) ||
    intent.metadata?.userId !== String(userId)
  ) {
    throw new CheckoutError('Payment verification failed', 400);
  }

  return intent;
};

// ─── Called from the Stripe webhook on payment_intent.succeeded ──────────────
const markPaymentSucceeded = async (intent) => {
  const order = await Order.findOne({ stripePaymentIntentId: intent.id });
  if (!order) return null;
  if (order.paymentStatus === 'Paid') return order;
  return Order.findByIdAndUpdate(order.id, { paymentStatus: 'Paid' });
};

module.exports = {
  CheckoutError,
  buildOrderItems,
  getCouponDiscount,
  recordCouponUsage,
  calculateOrderTotalOnServer,
  verifyStripeIntent,
  markPaymentSucceeded,
};