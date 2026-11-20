const express = require("express");
const Cart = require("../models/Cart");
const Session = require("../models/Session");

const router = express.Router();
const DEFAULT_KEY = "default";

async function getOrCreateCart(cartKey = DEFAULT_KEY) {
    let cart = await Cart.findOne({ cartKey });
    if (!cart) {
        cart = new Cart({ cartKey, items: [], subtotal: 0, totalQuantity: 0});
        cart.recalculateTotals();
        await cart.save();
    }
    return cart;
}

router.get("/", async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.query.cartKey || DEFAULT_KEY);
        cart.recalculateTotals();
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/items", async (req, res) => {
    try {
        const { sessionId, quantity = 1, cartKey = DEFAULT_KEY } = req.body || {};
        const parsedId = Number(sessionId);
        const parsedQty = Number(quantity);
        
        if (!Number.isFinite(parsedId)) {
            return res.status(400).json({ error: "Valid sessionId is required." });
        }
        if (!Number.isInteger(parsedQty) || parsedQty < 1) {
            return res.status(400).json({ error: "Quantity must be an integer of 1 or greater."});
        }
        
        const session = await Session.findOne({ id: parsedId });
        if (!session) {
            return res.status(404).json({ error: "Session not found in database." });
        }

        const cart = await getOrCreateCart(cartKey);
        const existing = cart.items.find((item) => item.sessionId === session.id);

        if (existing) {
            existing.quantity += parsedQty;
            existing.price = session.price;
            existing.title = session.title;
        } else {
            cart.items.push({
                sessionId:session.id,
                title: session.title,
                price: session.price,
                category: session.category,
                format: session.format,
                unit: session.unit || "Ticket",
                quantity: parsedQty,
                lineTotal: Number((session.price * parsedQty).toFixed(2)),
            });
        }
        
        cart.recalculateTotals();
        await cart.save();
        res.status(201).json(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE ITEM QUANTITY
router.patch("/items/:sessionId", async (req, res) => {
    try {
        const parsedId = Number(req.params.sessionId);
        const quantity = Number(req.body?.quantity);
        const cartKey = req.body?.cartKey || DEFAULT_KEY;

        if (!Number.isFinite(parsedId)) {
            return res.status(400).json({ error: "Invalid sessionId parameter." })
        }
        if (!Number.isInteger(quantity)) {
            return res.status(400).json({ error: "Quantity must be an integer."});
        }

        const cart = await getOrCreateCart(cartKey);
        const idx = cart.items.findIndex((item) => item.sessionId === parsedId);
        if (idx === -1) {
            return res.status(404).json({ error: "Item not found in cart."});
        }

        if (quantity <= 0) {
            cart.items.splice(idx, 1);
        } else {
            cart.items[idx].quantity = quantity;
        }

        cart.recalculateTotals();
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// REMOVE ITEM FROM CART
router.delete("/items/:sessionId", async (req, res) => {
    try {
        const parsedId = Number(req.params.sessionId);
        const cartKey = req.query.cartKey || DEFAULT_KEY;

        if (!Number.isFinite(parsedId)) {
            return res.status(400).json({ error: "Invalid sessionId parameter."});
        }

        const cart = await getOrCreateCart(cartKey);
        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => item.sessionId !== parsedId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ error: "Item not found in cart."});
        }

        cart.recalculateTotals();
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// CLEAR CART
router.delete("/", async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.query.cartKey || DEFAULT_KEY);
        cart.items = [];
        cart.recalculateTotals();
        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;