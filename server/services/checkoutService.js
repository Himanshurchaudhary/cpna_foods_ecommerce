const Stripe = require('stripe');
const Cart = require('../models/User/Cart');
const Product = require('../models/product_Management/Product');
const Order = require('../models/Order');
const PaymentSetting = require('../models/dependence/PaymentSetting');

class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const toMinor = (aed) => Math.round(Number(aed) * 100); // AED to fils

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

// ─── Pricing helpers: FILL THESE FROM YOUR EXISTING CODE ─────────────────────
// Coupon, delivery and tax logic is not in the files shared so far.
// Until these are filled in, any order with a coupon / delivery / tax will throw.

const getCouponDiscount = async ({ userId, couponCode, subtotal }) => {
  if (!couponCode) return 0;
  // TODO: validate coupon on the server (exists, active, not expired, min order,
  // per-user usage limit). Percentage: min(subtotal * value / 100, maxDiscount).
  // Fixed: value, but never more than subtotal.
  throw new CheckoutError('Coupon validation is not implemented yet', 501);
};

const getShippingCharge = async ({ subtotal }) => {
  // TODO: use the same rule as /api/delivery/charge-for-price.
  // Decide with the frontend whether delivery is based on subtotal or on
  // subtotal after discount, and keep it the same everywhere.
  throw new CheckoutError('Delivery charge calculation is not implemented yet', 501);
};

const getTaxAmount = async ({ taxableAmount }) => {
  // TODO: use active tax rates from your tax model. Apply on taxableAmount
  // (subtotal after discount), the same as the frontend display.
  throw new CheckoutError('Tax calculation is not implemented yet', 501);
};

// ─── Single source of truth for the order total ──────────────────────────────
const calculateOrderTotalOnServer = async ({ userId, body = {} }) => {
  const items = await buildOrderItems({ userId, body });

  const subtotal = round2(items.reduce((s, i) => s + i.total, 0));
  const couponDiscount = round2(await getCouponDiscount({ userId, couponCode: body.couponCode, subtotal }));
  const taxableAmount = round2(Math.max(0, subtotal - couponDiscount));
  const shippingCharge = round2(await getShippingCharge({ subtotal }));
  const tax = round2(await getTaxAmount({ taxableAmount }));
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
// If the order does not exist yet (browser closed before placeOrder),
// this does nothing. placeOrder verifies the intent itself, so it is safe.
const markPaymentSucceeded = async (intent) => {
  const order = await Order.findOne({ stripePaymentIntentId: intent.id });
  if (!order) return null;
  if (order.paymentStatus === 'Paid') return order;
  return Order.findByIdAndUpdate(order.id, { paymentStatus: 'Paid' });
};

module.exports = {
  CheckoutError,
  buildOrderItems,
  calculateOrderTotalOnServer,
  verifyStripeIntent,
  markPaymentSucceeded,
};