const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
    {
        sessionId: { type: Number, required: true },
        title: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, default: "" },
        format: { type: String, default: "" },
        unit: { type: String, default: "Ticket"},
        quantity: { type: Number, required: true, min: 1, defaault: 1 },
        lineTotal: { type: Number, required: true, min: 0 }
    },
    { _id: true }
);

const cartSchema = new mongoose.Schema(
    {
    cartKey: { type: String, required: true, unique: true, default: "default" },
    items: { type: [cartItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    totalQuantity: { type: Number, required: true, min: 0, default: 0 },
    },
    { timestamps: true }
);

cartSchema.methods.recalculateTotals = function recalculateTotals() {
    let subtotal = 0;
    let totalQuantity = 0;

    this.items.forEach((item) => {
        const qty = Math.max(1, Number(item.quantity) || 1);
        const unitPrice = Math.max(0, Number(item.price) || 0)
        item.quantity = qty;
        item.price = unitPrice;
        item.lineTotal = Number((qty * unitPrice).toFixed(2));
        subtotal += item.lineTotal;
        totalQuantity += qty;
    });

    this.subtotal = Number(subtotal.toFixed(2));
    this.totalQuantity = totalQuantity;
    return this;
};

module.exports = mongoose.model("Cart", cartSchema)