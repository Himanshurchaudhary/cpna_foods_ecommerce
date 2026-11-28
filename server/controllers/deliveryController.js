const DeliveryCharge = require('../models/DeliveryCharge');

const OVERLAP_MSG = 'Ye price range kisi existing range se overlap karta hai.';

// @desc Add New Delivery Charge
exports.addDeliveryCharge = async (req, res) => {
  try {
    const minOrderPrice = Number(req.body.minOrderPrice);
    const maxOrderPrice = Number(req.body.maxOrderPrice);
    const charge = Number(req.body.charge);

    if (!(minOrderPrice >= 0) || !(charge >= 0)) {
      return res.status(400).json({ success: false, message: 'Invalid values' });
    }
    if (minOrderPrice >= maxOrderPrice) {
      return res.status(400).json({
        success: false,
        message: 'Maximum order price must be greater than minimum order price',
      });
    }

    const overlap = await DeliveryCharge.findOverlap({ minOrderPrice, maxOrderPrice });
    if (overlap) {
      return res.status(400).json({ success: false, message: OVERLAP_MSG });
    }

    const newCharge = await DeliveryCharge.create({ minOrderPrice, maxOrderPrice, charge });

    res.status(201).json({
      success: true,
      message: 'Delivery charge added successfully',
      data: newCharge,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get All Delivery Charges
exports.getAllCharges = async (req, res) => {
  try {
    const charges = await DeliveryCharge.find();
    res.status(200).json({ success: true, charges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update Delivery Charge
exports.updateDeliveryCharge = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await DeliveryCharge.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Delivery charge not found' });
    }

    const { minOrderPrice, maxOrderPrice, charge } = req.body;
    const newMin = minOrderPrice !== undefined ? Number(minOrderPrice) : Number(existing.minOrderPrice);
    const newMax = maxOrderPrice !== undefined ? Number(maxOrderPrice) : Number(existing.maxOrderPrice);

    if (newMin >= newMax) {
      return res.status(400).json({
        success: false,
        message: 'Maximum order price must be greater than minimum order price',
      });
    }

    const overlap = await DeliveryCharge.findOverlap({
      minOrderPrice: newMin,
      maxOrderPrice: newMax,
      excludeId: id,
    });
    if (overlap) {
      return res.status(400).json({ success: false, message: OVERLAP_MSG });
    }

    const updateData = {};
    if (minOrderPrice !== undefined) updateData.minOrderPrice = newMin;
    if (maxOrderPrice !== undefined) updateData.maxOrderPrice = newMax;
    if (charge !== undefined) updateData.charge = Number(charge);

    const updated = await DeliveryCharge.findByIdAndUpdate(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Delivery charge updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete Delivery Charge
exports.deleteDeliveryCharge = async (req, res) => {
  try {
    const deleted = await DeliveryCharge.findByIdAndDelete(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Delivery charge not found' });
    }
    res.status(200).json({ success: true, message: 'Delivery charge deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Charge for a specific order price (public, used by checkout display)
exports.getChargeForPrice = async (req, res) => {
  try {
    const price = Number(req.query.price) || 0;
    const row = await DeliveryCharge.findForPrice(price);
    res.json({ success: true, charge: Number(row?.charge ?? 0) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};