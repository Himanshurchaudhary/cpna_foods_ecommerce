const PaymentSetting = require('../../models/dependence/PaymentSetting');
const Stripe = require('stripe');
const {
    calculateOrderTotalOnServer,
    markPaymentSucceeded,
} = require('../../services/checkoutService');

const GATEWAY_NAMES = ['Stripe', 'Razorpay'];
const MODES = ['Test', 'Live'];

const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

// Masked values look like "sk_test_****abcd". They are never sent back to the DB.
const maskSecret = (v) => {
    if (!v) return '';
    if (v.length <= 12) return '********';
    return `${v.slice(0, 8)}****${v.slice(-4)}`;
};
const isMasked = (v) => !v || String(v).includes('****');

const sanitize = (row) => ({
    ...row,
    status: toBool(row.status),
    secretKey: maskSecret(row.secretKey),
    webhookSecret: maskSecret(row.webhookSecret),
});

// Turns form input into clean values. undefined means "do not change this column".
const parseInput = (body = {}) => {
    const clean = (v) => {
        if (v === undefined || v === null || v === '') return undefined;
        const s = String(v).trim();
        return isMasked(s) ? undefined : s;
    };
    return {
        gatewayName: body.gatewayName,
        status: body.status === undefined ? undefined : toBool(body.status),
        mode: clean(body.mode),
        secretKey: clean(body.secretKey),
        publishedKey: clean(body.publishedKey),
        webhookSecret: clean(body.webhookSecret),
        title: clean(body.title),
    };
};

// Checks that keys match the mode (Test keys with Test mode, Live keys with Live mode).
const validateKeys = ({ gatewayName, mode, secretKey, publishedKey }) => {
    const isLive = mode === 'Live';

    if (gatewayName === 'Stripe') {
        const secretPrefix = isLive ? 'sk_live_' : 'sk_test_';
        const publishPrefix = isLive ? 'pk_live_' : 'pk_test_';
        if (!secretKey?.startsWith(secretPrefix)) {
            return `Stripe secret key must start with ${secretPrefix} in ${mode} mode`;
        }
        if (!publishedKey?.startsWith(publishPrefix)) {
            return `Stripe published key must start with ${publishPrefix} in ${mode} mode`;
        }
        return null;
    }

    // Razorpay
    const keyPrefix = isLive ? 'rzp_live_' : 'rzp_test_';
    if (!publishedKey?.startsWith(keyPrefix)) {
        return `Razorpay key must start with ${keyPrefix} in ${mode} mode`;
    }
    if (!secretKey) return 'Razorpay secret is required';
    return null;
};

// ─── Admin: list all gateways (secrets masked) ────────────────────────────────
exports.getAllGatewaySettings = async (req, res) => {
    try {
        const rows = await PaymentSetting.find();
        const settings = rows
            .filter((s) => GATEWAY_NAMES.includes(s.gatewayName))
            .map(sanitize);
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not load gateway settings', error: error.message });
    }
};

// ─── Admin: add a gateway (only once per gateway) ─────────────────────────────
exports.addPaymentSettings = async (req, res) => {
    try {
        const input = parseInput(req.body);
        const gatewayName = input.gatewayName;

        if (!GATEWAY_NAMES.includes(gatewayName)) {
            return res.status(400).json({ success: false, message: 'Only Stripe and Razorpay are supported.' });
        }

        if (await PaymentSetting.findOne({ gatewayName })) {
            return res.status(400).json({
                success: false,
                message: `${gatewayName} settings already exist. Use the update endpoint.`,
            });
        }

        const mode = input.mode || 'Test';
        if (!MODES.includes(mode)) {
            return res.status(400).json({ success: false, message: 'Mode must be Test or Live.' });
        }
        if (!input.secretKey || !input.publishedKey) {
            return res.status(400).json({ success: false, message: 'Secret key and published key are required.' });
        }

        const keyError = validateKeys({ gatewayName, mode, ...input });
        if (keyError) return res.status(400).json({ success: false, message: keyError });

        const created = await PaymentSetting.create({
            gatewayName,
            status: input.status ?? false,
            mode,
            secretKey: input.secretKey,
            publishedKey: input.publishedKey,
            webhookSecret: input.webhookSecret,
            title: input.title || gatewayName,
            logo: req.file ? req.file.path : undefined,
        });

        res.status(201).json({
            success: true,
            message: `${gatewayName} added successfully!`,
            settings: sanitize(created),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not add gateway', error: error.message });
    }
};

// ─── Admin: update a gateway (creates it if missing) ──────────────────────────
exports.updatePaymentSettings = async (req, res) => {
    try {
        const input = parseInput(req.body);
        const gatewayName = input.gatewayName;

        if (!GATEWAY_NAMES.includes(gatewayName)) {
            return res.status(400).json({ success: false, message: 'Only Stripe and Razorpay are supported.' });
        }

        const existing = await PaymentSetting.findOne({ gatewayName });

        const mode = input.mode ?? existing?.mode ?? 'Test';
        if (!MODES.includes(mode)) {
            return res.status(400).json({ success: false, message: 'Mode must be Test or Live.' });
        }

        // Masked or empty secrets keep the stored value, so validate the merged result
        const secretKey = input.secretKey ?? existing?.secretKey;
        const publishedKey = input.publishedKey ?? existing?.publishedKey;
        if (!secretKey || !publishedKey) {
            return res.status(400).json({ success: false, message: 'Secret key and published key are required.' });
        }

        const keyError = validateKeys({ gatewayName, mode, secretKey, publishedKey });
        if (keyError) return res.status(400).json({ success: false, message: keyError });

        const saved = await PaymentSetting.findOneAndUpdate(
            { gatewayName },
            {
                mode,
                secretKey: input.secretKey,
                publishedKey: input.publishedKey,
                webhookSecret: input.webhookSecret,
                title: input.title,
                status: input.status,
                logo: req.file ? req.file.path : undefined,
            }
        );

        res.status(200).json({
            success: true,
            message: `${gatewayName} settings updated successfully!`,
            settings: sanitize(saved),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not update gateway', error: error.message });
    }
};

// ─── Admin: turn a gateway on or off ──────────────────────────────────────────
exports.toggleGatewayStatus = async (req, res) => {
    try {
        const { gatewayName } = req.params;
        if (!GATEWAY_NAMES.includes(gatewayName)) {
            return res.status(404).json({ success: false, message: `${gatewayName} not found` });
        }

        const row = await PaymentSetting.findOne({ gatewayName });
        if (!row) {
            return res.status(404).json({ success: false, message: `${gatewayName} not found` });
        }

        const turningOn = !toBool(row.status);
        if (turningOn) {
            if (!row.secretKey || !row.publishedKey) {
                return res.status(400).json({ success: false, message: `Add ${gatewayName} keys before enabling it.` });
            }
            const keyError = validateKeys(row);
            if (keyError) return res.status(400).json({ success: false, message: keyError });
        }

        const updated = await PaymentSetting.findOneAndUpdate({ gatewayName }, { status: turningOn });

        res.status(200).json({
            success: true,
            message: `${gatewayName} is now ${toBool(updated.status) ? 'Active' : 'Inactive'}`,
            status: toBool(updated.status),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not change gateway status', error: error.message });
    }
};

// ─── Public: active gateways for checkout (no secrets) ────────────────────────
exports.getActiveGateways = async (req, res) => {
    try {
        const rows = await PaymentSetting.find({ status: true }, ['secretKey', 'webhookSecret']);
        const gateways = rows.map((r) => ({
            gatewayName: r.gatewayName,
            title: r.title,
            logo: r.logo,
            mode: r.mode,
            publishedKey: r.publishedKey,
        }));
        res.status(200).json({ success: true, gateways });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not load gateways', error: error.message });
    }
};

// ─── User: create a Stripe PaymentIntent with a server-calculated AED total ──
exports.createStripeIntent = async (req, res) => {
    try {
        const config = await PaymentSetting.findOne({ gatewayName: 'Stripe' });
        if (!config || !toBool(config.status)) {
            return res.status(400).json({ success: false, message: 'Card payment is not available right now.' });
        }

        const { amount } = await calculateOrderTotalOnServer({ userId: req.user.id, body: req.body });
        const amountMinor = Math.round(Number(amount) * 100); // AED to fils

        if (!(amountMinor > 0)) {
            return res.status(400).json({ success: false, message: 'Invalid order total.' });
        }

        const stripe = new Stripe(config.secretKey);
        const intent = await stripe.paymentIntents.create({
            amount: amountMinor,
            currency: 'aed',
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: String(req.user.id),
                addressId: String(req.body.addressId || ''),
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: intent.client_secret,
            paymentIntentId: intent.id,
            publishableKey: config.publishedKey,
            amount: Number(amount),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Payment could not be initiated', error: error.message });
    }
};

// ─── Stripe webhook (must receive the raw body, see app.js) ───────────────────
exports.stripeWebhook = async (req, res) => {
    try {
        const config = await PaymentSetting.findOne({ gatewayName: 'Stripe' });
        if (!config?.webhookSecret) {
            return res.status(400).send('Stripe webhook is not configured');
        }

        const stripe = new Stripe(config.secretKey);
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                req.headers['stripe-signature'],
                config.webhookSecret
            );
        } catch (err) {
            return res.status(400).send(`Webhook signature error: ${err.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            await markPaymentSucceeded(event.data.object);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        // Non-2xx makes Stripe retry the webhook
        res.status(500).json({ success: false, error: error.message });
    }
};