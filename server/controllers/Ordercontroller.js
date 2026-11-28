const Order = require('../models/Order');
const Cart = require('../models/User/Cart');
const User = require('../models/User/User');
const sendSms = require('../utils/sendSms');
const { orderPlacedEmail, orderStatusEmail, riderAssignedEmail, driverAssignedEmail } = require('../utils/emailTemplates');
const sendNotification = require('../utils/sendNotification');
const fireAndForget = require('../utils/fireAndForget');
const {
  CheckoutError,
  calculateOrderTotalOnServer,
  verifyStripeIntent,
  recordCouponUsage,
} = require('../services/checkoutService');

// ─── Snapshot Address ─────────────────────────────────────────────────────────
const snapshotAddress = (addr) => ({
  name: addr.name || '',
  phone: addr.phone || '',
  altPhone: addr.altPhone || '',
  house: addr.house || '',
  road: addr.road || '',
  city: addr.city || '',
  state: addr.state || '',
  pincode: addr.pincode || '',
  landmark: addr.landmark || '',
  type: addr.type || 'Home',
});

// ─── Place Order ──────────────────────────────────────────────────────────────
// Client sends only: addressId, paymentMethod, note, couponCode, stripePaymentIntentId,
// and buy-now fields (buyNow, productId, quantity, variantId).
// Every amount is calculated on the server.
exports.placeOrder = async (req, res) => {
  try {
    const {
      addressId,
      paymentMethod = 'COD',
      note = '',
      couponCode = null,
      stripePaymentIntentId = null,
      buyNow = false,
      productId = null,
    } = req.body;

    if (!['COD', 'Card'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    // ── 1. User + address ─────────────────────────────────────────────────
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addresses = user.address ?? [];
    const address = addressId
      ? addresses.find((a) => a.id == addressId)
      : addresses.find((a) => a.isDefault) || addresses[0];

    if (!address) {
      return res.status(400).json({ success: false, message: 'No delivery address found. Please add one.' });
    }

    // ── 2. Server-side pricing (same function used for the PaymentIntent) ──
    const { items, subtotal, couponDiscount, shippingCharge, tax, amount } =
      await calculateOrderTotalOnServer({ userId: req.user.id, body: req.body });

    // ── 3. Card: verify the Stripe payment before saving the order ────────
    let paymentStatus = 'Pending';

    if (paymentMethod === 'Card') {
      await verifyStripeIntent({
        intentId: stripePaymentIntentId,
        userId: req.user.id,
        amount,
      });

      const alreadyUsed = await Order.findOne({ stripePaymentIntentId });
      if (alreadyUsed) {
        return res.status(409).json({
          success: false,
          message: 'This payment has already been used for an order.',
        });
      }
      paymentStatus = 'Paid';
    }

    // ── 4. Create order ───────────────────────────────────────────────────
    let order;
    try {
      order = await Order.create({
        user: req.user.id,
        items,
        subtotal,
        discount: couponDiscount,
        shippingCharge,
        tax,
        total: amount,
        couponCode: couponCode || null,
        couponDiscount,
        shippingAddress: snapshotAddress(address),
        paymentMethod,
        paymentStatus,
        stripePaymentIntentId: paymentMethod === 'Card' ? stripePaymentIntentId : null,
        note,
        estimatedDeliveryAt: null,
      });
    } catch (err) {
      // Same PaymentIntent sent twice at the same time hits the UNIQUE constraint
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'This payment has already been used for an order.',
        });
      }
      throw err;
    }

    // ── 5. Record coupon usage (for limitPerUser) ─────────────────────────
    if (couponCode && couponDiscount > 0) {
      await recordCouponUsage({ couponCode, userId: req.user.id, orderId: order.id });
    }

    // ── 6. Clear cart (not for buy-now) ───────────────────────────────────
    const isBuyNow = !!buyNow && !!productId;
    if (!isBuyNow) {
      await Cart.clearByUser(req.user.id);
    }

    // ── 7. Respond ────────────────────────────────────────────────────────
    res.status(201).json({ success: true, message: 'Order placed successfully!', order });

    // ── 8. Background notifications ───────────────────────────────────────
    fireAndForget(async () => {
      const { subject, html } = orderPlacedEmail(user.fullName, order.id, amount, paymentMethod);
      const message = `Hello ${user.name}! Order #${order.id} placed. Total: AED${amount}. – OrchardEngine`;
      await sendNotification({ phone: user.phone, email: user.email, subject, message, html });

      if (user.phone) {
        const smsMessage =
          `Hello ${user.name || user.fullName}!\n\n` +
          `Your order has been placed successfully.\n` +
          `Order ID  : #${order.id}\n` +
          `Total     : Rs.${amount}\n` +
          `Payment   : ${paymentMethod}\n\n` +
          `We will notify you once it's shipped.\n` +
          `– theorchardengine Team`;
        await sendSms(user.phone, smsMessage);
      }
    }, 'place-order-notifications');

  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('[POST /api/orders/place]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get My Orders ────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Single Order (user-scoped) ───────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id, user_id: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Cancel Order ─────────────────────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      id: Number(req.params.id),
      user_id: req.user.id,
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${order.status} order`,
      });
    }

    const user = await User.findById(order.user_id);
    const cancelledAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const updated = await Order.findByIdAndUpdate(Number(req.params.id), {
      status: 'Cancelled',
      cancelledAt,
    });

    res.json({ success: true, message: 'Order cancelled', order: updated });

    fireAndForget(async () => {
      if (user?.phone) {
        const smsMessage =
          `Hello ${user.name || user.fullName}!\n\n` +
          `Your order #${order.orderNumber} has been cancelled.\n` +
          `If you did not request this, please contact support.\n\n` +
          `– theorchardengine Team`;
        await sendSms(user.phone, smsMessage);
      }
    }, 'cancel-order-sms');
  } catch (err) {
    console.error('[PATCH /cancel]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get All Orders (paginated + filtered) ─────────────────────────────
exports.adminGetAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      paymentMethod,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filters = {};
    if (status && status !== 'All') filters.status = status;
    if (paymentStatus && paymentStatus !== 'All') filters.paymentStatus = paymentStatus;
    if (paymentMethod && paymentMethod !== 'All') filters.paymentMethod = paymentMethod;

    if (dateFrom) filters.dateFrom = new Date(dateFrom).toISOString().slice(0, 19).replace('T', ' ');
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filters.dateTo = end.toISOString().slice(0, 19).replace('T', ' ');
    }

    const { orders, total } = await Order.adminFind({
      filters,
      search: search?.trim() || null,
      sortBy,
      sortOrder,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      success: true,
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Update Order Status ───────────────────────────────────────────────
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    if (!status && !paymentStatus) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const updateData = {};

    if (status) {
      updateData.status = status;

      if (status === 'Delivered') {
        updateData.deliveredAt = new Date();
        updateData.paymentStatus = 'Paid';
      }

      if (status === 'Cancelled') {
        updateData.cancelledAt = new Date();
      }
    }

    // Delivered forces Paid above, so the body cannot override it back
    if (paymentStatus && status !== 'Delivered') {
      updateData.paymentStatus = paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) {
      await Order.pushStatusHistory(req.params.id, status);
    }

    const updatedOrder = await Order.findById(req.params.id);
    res.json({ success: true, order: updatedOrder });

    fireAndForget(async () => {
      if (!status) return;

      const customer = await User.findById(order.user_id);
      if (!customer) return;

      const { subject, html } = orderStatusEmail(customer.fullName, order.id, status);
      const message = `Hello ${customer.name}! Your order #${order.id} status: ${status}. – theorchardengine`;
      await sendNotification({ phone: customer.phone, email: customer.email, subject, message, html });

      if (customer.phone) {
        const statusMessages = {
          'Processing': `Your order #${order.id} is being prepared.`,
          'Shipped': `Your order #${order.id} has been shipped!`,
          'Picked Up': `Your order #${order.id} has been picked up by the driver.`,
          'In Transit': `Your order #${order.id} is in transit.`,
          'On The Way': `Your order #${order.id} is almost there!`,
          'Delivered': `Your order #${order.id} has been delivered. Thank you!`,
          'Cancelled': `Your order #${order.id} has been cancelled.`,
        };

        const smsMessage =
          `Hello ${customer.name || customer.fullName}!\n\n` +
          (statusMessages[status] || `Your order #${order.id} status: ${status}`) +
          `\n\n– theorchardengine Team`;

        await sendSms(customer.phone, smsMessage);
      }
    }, 'order-status-update-notifications');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Assign Rider ──────────────────────────────────────────────────────
exports.adminAssignRider = async (req, res) => {
  try {
    const { driverId } = req.body;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'driverId is required' });
    }

    const Driver = require('../models/Driver');
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, {
      assignedDriver_id: driverId,
      status: 'Shipped',
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.pushStatusHistory(req.params.id, 'Shipped', `Assigned to driver ${driver.fullName}`);

    res.json({ success: true, message: 'Rider assigned successfully', order });

    fireAndForget(async () => {
      const customer = await User.findById(order.user_id);

      if (customer) {
        const { subject: cs, html: ch } = riderAssignedEmail(
          customer.fullName,
          order.id,
          driver.fullName,
          driver.phone
        );
        await sendNotification({
          phone: customer.phone,
          email: customer.email,
          subject: cs,
          message: `Driver ${driver.fullName} assigned to your order #${order.id}.`,
          html: ch,
        });

        if (customer.phone) {
          const customerSms =
            `Hello ${customer.name || customer.fullName}!\n\n` +
            `Great news! Your order #${order.id} has been assigned to a delivery driver.\n` +
            `Driver : ${driver.fullName}\n` +
            `Phone  : ${driver.phone}\n\n` +
            `Your order is on its way!\n` +
            `– theorchardengine Team`;
          await sendSms(customer.phone, customerSms);
        }
      }

      const { subject: ds, html: dh } = driverAssignedEmail(
        driver.fullName,
        order.id,
        order.shippingAddress?.city,
        order.shippingAddress?.pincode,
        order.shippingAddress?.name,
        order.shippingAddress?.phone
      );
      await sendNotification({
        phone: driver.phone,
        email: driver.email,
        subject: ds,
        message: `New order #${order.id} assigned to you. – theorchardengine`,
        html: dh,
      });

      if (driver.phone) {
        const driverSms =
          `Hello ${driver.fullName}!\n\n` +
          `A new order has been assigned to you.\n` +
          `Order ID : #${order.id}\n` +
          `Address  : ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.pincode || ''}\n` +
          `Customer : ${order.shippingAddress?.name || ''}\n` +
          `Phone    : ${order.shippingAddress?.phone || ''}\n\n` +
          `Please pick it up as soon as possible.\n` +
          `– theorchardengine Team`;
        await sendSms(driver.phone, driverSms);
      }
    }, 'assign-rider-notifications');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Get Single Order Detail ───────────────────────────────────────────
exports.adminGetOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Admin: Set Delivery Estimate ─────────────────────────────────────────────
exports.adminSetDeliveryEstimate = async (req, res) => {
  try {
    const { estimatedDeliveryAt } = req.body;

    if (!estimatedDeliveryAt) {
      return res.status(400).json({ success: false, message: 'estimatedDeliveryAt required' });
    }

    const formatted = new Date(estimatedDeliveryAt)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const order = await Order.findByIdAndUpdate(req.params.id, {
      estimatedDeliveryAt: formatted,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updated = await Order.findById(req.params.id);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};