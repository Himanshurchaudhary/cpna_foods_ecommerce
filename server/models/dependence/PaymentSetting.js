const { pool } = require('../../config/db');

const ALL_COLUMNS = [
    'id', 'gatewayName', 'status', 'mode', 'secretKey', 'publishedKey',
    'webhookSecret', 'title', 'logo', 'createdAt', 'updatedAt',
];

// Only these columns can ever reach SQL. Anything else is rejected.
const WRITABLE_COLUMNS = [
    'gatewayName', 'status', 'mode', 'secretKey', 'publishedKey',
    'webhookSecret', 'title', 'logo',
];

const assertColumns = (keys) => {
    const invalid = keys.filter((k) => !WRITABLE_COLUMNS.includes(k));
    if (invalid.length) throw new Error(`Invalid column(s): ${invalid.join(', ')}`);
};

const definedKeys = (obj = {}) => Object.keys(obj).filter((k) => obj[k] !== undefined);

const buildWhere = (filters = {}) => {
    const keys = definedKeys(filters);
    assertColumns(keys);
    return {
        clause: keys.map((k) => `${k} = ?`).join(' AND '),
        values: keys.map((k) => filters[k]),
    };
};

const createPaymentSettingTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS payment_settings (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            gatewayName   ENUM('Stripe', 'Razorpay') NOT NULL UNIQUE,
            status        BOOLEAN DEFAULT false,
            mode          ENUM('Test', 'Live') DEFAULT 'Test',
            secretKey     VARCHAR(500) NOT NULL,
            publishedKey  VARCHAR(500) NOT NULL,
            webhookSecret VARCHAR(500) NULL,
            title         VARCHAR(255) DEFAULT 'Online Payment',
            logo          VARCHAR(500),
            createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
};

// Adds webhookSecret to tables created before this change.
const ensureWebhookColumn = async () => {
    const [rows] = await pool.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'payment_settings'
           AND COLUMN_NAME = 'webhookSecret'`
    );
    if (rows.length === 0) {
        await pool.query(`ALTER TABLE payment_settings ADD COLUMN webhookSecret VARCHAR(500) NULL`);
    }
};

const PaymentSetting = {
    // Single row by filter, e.g. { gatewayName: 'Stripe' }
    findOne: async (filters = {}) => {
        const { clause, values } = buildWhere(filters);
        const sql = `SELECT ${ALL_COLUMNS.join(', ')} FROM payment_settings
                     ${clause ? `WHERE ${clause}` : ''} LIMIT 1`;
        const [rows] = await pool.query(sql, values);
        return rows[0] ?? null;
    },

    // Multiple rows, optional filters, optional excluded columns (e.g. ['secretKey'])
    find: async (filters = {}, excludeFields = []) => {
        const { clause, values } = buildWhere(filters);
        const selected = ALL_COLUMNS.filter((c) => !excludeFields.includes(c)).join(', ');
        const sql = `SELECT ${selected} FROM payment_settings ${clause ? `WHERE ${clause}` : ''}`;
        const [rows] = await pool.query(sql, values);
        return rows;
    },

    create: async (data) => {
        const fields = definedKeys(data);
        assertColumns(fields);
        if (fields.length === 0) throw new Error('No data to insert');

        const [result] = await pool.query(
            `INSERT INTO payment_settings (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
            fields.map((f) => data[f])
        );
        const [rows] = await pool.query(
            `SELECT ${ALL_COLUMNS.join(', ')} FROM payment_settings WHERE id = ?`,
            [result.insertId]
        );
        return rows[0];
    },

    // Upsert by filter. Keys with undefined values are skipped, so they are never overwritten.
    findOneAndUpdate: async (filters, data) => {
        const fields = definedKeys(data);
        assertColumns(fields);

        const existing = await PaymentSetting.findOne(filters);
        if (!existing) return PaymentSetting.create({ ...filters, ...data });
        if (fields.length === 0) return existing;

        const { clause, values } = buildWhere(filters);
        if (!clause) throw new Error('findOneAndUpdate requires a filter');

        await pool.query(
            `UPDATE payment_settings SET ${fields.map((f) => `${f} = ?`).join(', ')} WHERE ${clause}`,
            [...fields.map((f) => data[f]), ...values]
        );
        return PaymentSetting.findOne(filters);
    },
};

const initPaymentSettingTable = async () => {
    try {
        await createPaymentSettingTable();
        await ensureWebhookColumn();
    } catch (err) {
        console.error('payment_settings table init failed:', err);
    }
};
initPaymentSettingTable();

module.exports = PaymentSetting;