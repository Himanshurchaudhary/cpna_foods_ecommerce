const { pool } = require('../config/db');

const createDeliveryChargeTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_charges (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      minOrderPrice  DECIMAL(10,2) NOT NULL CHECK (minOrderPrice >= 0),
      maxOrderPrice  DECIMAL(10,2) NOT NULL CHECK (maxOrderPrice >= 0),
      charge         DECIMAL(10,2) NOT NULL CHECK (charge >= 0),
      isActive       BOOLEAN       DEFAULT true,
      createdAt      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updatedAt      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

createDeliveryChargeTable().catch((err) =>
  console.error('delivery_charges table init failed:', err)
);

const DeliveryCharge = {
  create: async ({ minOrderPrice, maxOrderPrice, charge }) => {
    const [result] = await pool.query(
      `INSERT INTO delivery_charges (minOrderPrice, maxOrderPrice, charge) VALUES (?, ?, ?)`,
      [minOrderPrice, maxOrderPrice, charge]
    );
    const [rows] = await pool.query(
      `SELECT * FROM delivery_charges WHERE id = ?`,
      [result.insertId]
    );
    return rows[0];
  },

  find: async () => {
    const [rows] = await pool.query(
      `SELECT * FROM delivery_charges ORDER BY minOrderPrice ASC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT * FROM delivery_charges WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  },

  findByIdAndUpdate: async (id, data) => {
    const fields = Object.keys(data);
    if (fields.length === 0) return DeliveryCharge.findById(id);

    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f]);

    await pool.query(
      `UPDATE delivery_charges SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return DeliveryCharge.findById(id);
  },

  findByIdAndDelete: async (id) => {
    const existing = await DeliveryCharge.findById(id);
    if (!existing) return null;
    await pool.query(`DELETE FROM delivery_charges WHERE id = ?`, [id]);
    return existing;
  },

  // Ranges are [min, max). Two ranges overlap when
  // existing.min < new.max AND existing.max > new.min.
  findOverlap: async ({ minOrderPrice, maxOrderPrice, excludeId = 0 }) => {
    const [rows] = await pool.query(
      `SELECT id, minOrderPrice, maxOrderPrice
       FROM delivery_charges
       WHERE id <> ?
         AND minOrderPrice < ?
         AND maxOrderPrice > ?
       LIMIT 1`,
      [excludeId, maxOrderPrice, minOrderPrice]
    );
    return rows[0] ?? null;
  },

  // Returns the single active range that contains this price.
  findForPrice: async (price) => {
    const [rows] = await pool.query(
      `SELECT * FROM delivery_charges
       WHERE isActive = true
         AND minOrderPrice <= ?
         AND maxOrderPrice > ?
       ORDER BY minOrderPrice DESC
       LIMIT 1`,
      [price, price]
    );
    return rows[0] ?? null;
  },
};

module.exports = DeliveryCharge;