import { Fragment, useCallback, useEffect, useState } from "react";
import "../styles/Cart.css";

const FIELDS = ["productId", "productDescription", "productCategory", "productUnit", "productPrice"];
const EMPTY_FORM = Object.fromEntries(FIELDS.map((f) => [f, ""]));

// returns an error message for one field, or "" if valid
function validateField(id, raw) {
    const value = raw.trim();
    const rexID = /^\d+$/;
    const rexDesc = /^[A-Za-z0-9\s\-',.&:()]+$/;
    const rexAlphaNum = /^[a-zA-Z0-9\s]+$/;
    const rexPrice = /^[0-9]+(\.[0-9]{1,2})?$/;

    switch (id) {
        case "productId":
            if (value === "") return "Product ID is required.";
            if (!rexID.test(value) || Number(value) <= 0) 
                return "Product ID must be a whole number greater than 0.";
            return "";
        case "productDescription":
            if (value === "") return "Description is required.";
            if (!rexDesc.test(value))
                return "Description must be a string of characters (letters, numbers, spaces, and common punctuation allowed).";
            return "";
        case "productCategory":
            if (value === "") return "Category is required.";
            if (!rexAlphaNum.test(value)) return "Category must be alphanumeric.";
            return "";
        case "productUnit":
            if (value === "") return "Unit of Measure is required.";
            if (!rexAlphaNum.test(value)) 
                return "Unit of Measure must be alphanumeric.";
            return "";
        case "productPrice":
            if (value === "") return "Price is required.";
            if (!rexPrice.test(value)) 
                return "Price must be a valid number with at most 2 decimal places.";
            return "";
        default:
            return "";
    }
}

export default function Cart() {
    const [products, setProducts] = useState([]);   // raw data from sessions.json
    const [loaded, setLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const [cartData, setCartData] = useState({ items: [], subtotal: 0, totalQuantity: 0});
    const [busyId, setBusyId] = useState(null);
    const [query, setQuery] = useState("");

    const [form, setForm] = useState(EMPTY_FORM);
    const [fieldState, setFieldState] = useState({}); // id -> "is-valid" | "is-invalid"
    const [formMessage, setFormMessage] = useState({ cls: "", lines: [] });

    const [apiMessage, setApiMessage] = useState("");

    const loadSessions = useCallback(async () => { 
        try {
            const res = await fetch("/sessions");
            if (!res.ok) throw new Error("Failed to load sessions");
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
            setLoadError(false);
        } catch {
            setLoadError(true);
        } finally {
            setLoaded(true);
        }
    }, []);

    const loadCart = useCallback(async () => {
        try {
            const res = await fetch("/cart");
            if (!res.ok) throw new Error("Failed to load cart");
            const data = await res.json();
            setCartData({
                items: Array.isArray(data.items) ? data.items : [],
                subtotal: Number(data.subtotal || 0),
                totalQuantity: Number(data.totalQuantity || 0),
            });
        } catch {
            setApiMessage("Could not load persisted cart from server.")
        }
    }, []);
    
    useEffect(() => {
        loadSessions();
        loadCart();
    }, [loadSessions, loadCart]);

    // The sessions shown in "Available Sessions", built from sessions.json
    const sessions = products.map((p) => ({
        id: p.id,
        name: p.title,
        price: Number(p.price),
    }));

    /* ---------- cart actions ---------- */
    const getCartItem = (sessionId) =>
        cartData.items.find((item) => Number(item.sessionId) === Number(sessionId));

    
    const addToCart = async (session) => {
        setBusyId(session.id);
        setApiMessage("");
        try {
            const res = await fetch("/cart/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: session.id, quantity: 1}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not add item to cart.");
            setCartData(data);
        } catch (err) {
            setApiMessage(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const updateQuantity = async (sessionId, quantity) => {
        setBusyId(sessionId);
        setApiMessage("");
        try {
            const res = await fetch(`/cart/items/${sessionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not update quantity.");
            setCartData(data);
        } catch (err) {
            setApiMessage(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const removeFromCart = async (sessionId) => {
        setBusyId(sessionId);
        setApiMessage("");
        try {
            const res = await fetch(`/cart/items/${sessionId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not remove item.");
            setCartData(data);
        } catch (err) {
            setApiMessage(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const clearCart = async () => {
        setApiMessage("");
        try {
            const res = await fetch("/cart", { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not clear cart.");
            setCartData(data);
        } catch (err) {
            setApiMessage(err.message);
        }
    }

    // Matches the original: filters on the "Name - $price" text
    const term = query.toLowerCase().trim();
    const visibleSessions = sessions.filter((s) =>
        `${s.name} - $${s.price}`.toLowerCase().includes(term)
    );

    /* ---------- form ---------- */
    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm({ ...form, [id]: value });
        setFieldState({ ...fieldState, [id]: "" }); // clear state while the user fixes it
    };

    // returns true if every field is valid
    function validateProductForm() {
        const errors = [];
        const next = {};

        FIELDS.forEach((id) => {
            const msg = validateField(id, form[id]);
            if (msg) {
                errors.push(msg);
                next[id] = "is-invalid";
            } else {
                next[id] = "is-valid";
            }
        });

        setFieldState(next);

        if (errors.length > 0) {
            setFormMessage({ cls: "text-danger", lines: errors });
            return false;
        }
        setFormMessage({ cls: "text-success", lines: ["Session is valid."] });
        return true;
    }

    // Note: Since title and description are both attached to productDescription, they pull from the same field
    const buildSessionPayload = () => ({
        id: Number(form.productId.trim()),
        title: form.productDescription.trim(),
        description: form.productDescription.trim(),
        category: form.productCategory.trim(),
        unit: form.productUnit.trim(),
        format: "In-Person",
        price: Number(form.productPrice.trim()),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateProductForm()) return;

        try {
            const payload = buildSessionPayload();
            const res = await fetch("/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create session.");

            setFormMessage({ cls: "text-success", lines: ["Session created in database."] });
            setForm(EMPTY_FORM);
            setFieldState({});
            await loadSessions();
        } catch (err) {
            setFormMessage({ cls: "text-danger", lines: [err.message] });
        }
    };
    const handleUpdate = async () => {
        if (!validateProductForm()) return;

        try {
            const payload = buildSessionPayload();
            const res = await fetch(`/sessions/${payload.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update session.");

            setFormMessage({ cls: "text-success", lines: ["Session updated in database."] });
            await loadSessions();
            await loadCart();
        } catch (err) {
            setFormMessage({ cls: "text-danger", lines: [err.message] });
        }
    };

    const fieldClass = (id) => `form-control ${fieldState[id] || ""}`.trim();

    return (
        <div className="container mt-4">
            <h1>Shopping Cart</h1>
            <p>Search for conference sessions and add them to your cart.</p>

            {/* Search */}
            <h3>Search Sessions</h3>
            <input
                type="text"
                id="productSearch"
                placeholder="Search sessions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {/* Results already filter live as you type, so this button has nothing extra to do */}
            <button id="searchButton" type="button">Search</button>

            <hr />

            {/* Sessions (Fragment keeps each <p> and button as direct children of the grid) */}
            <h3>Available Sessions</h3>
            <div id="productList">
                {visibleSessions.map((s) => {
                    const existingItem = getCartItem(s.id);
                    return (
                        <Fragment key={s.id}>
                            <p>{s.name} - ${s.price}</p>
                            <button
                                className="addToCart"
                                disabled={busyId === s.id}
                                onClick={() => addToCart(s)}
                            >
                                {existingItem
                                    ? `Add Another (${existingItem.quantity} in cart)`
                                    : "Add to Cart"}
                            </button>
                        </Fragment>
                    );
                })}

                {loadError && (
                    <p id="noResults" className="text-danger">Could not load sessions from server.</p>
                )}
                {loaded && !loadError && visibleSessions.length === 0 && (
                    <p id="noResults" className="text-muted">No sessions found.</p>
                )}
            </div>

            <hr />

            {/* Cart */}
            <h3>Your Cart</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th>Session</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Line Total</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody id="cartItems">
                    {cartData.items.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-muted">Your cart is empty.</td>
                        </tr>
                    )}
                    {cartData.items.map((item) => (
                        <tr key={item.sessionId}>
                            <td>{item.title}</td>
                            <td>${Number(item.price).toFixed(2)}</td>
                            <td>
                                <button
                                    type="button" 
                                    disabled={busyId === item.sessionId || Number(item.quantity) <= 1}
                                    onClick={() => updateQuantity(item.sessionId, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                <span>{item.quantity}</span>
                                <button type="button" 
                                disabled={busyId === item.sessionId}
                                onClick={() => updateQuantity(item.sessionId, item.quantity + 1)}
                                >
                                    +
                                </button>
                            </td>
                            <td>${Number(item.lineTotal ?? item.price * item.quantity).toFixed(2)}</td>
                        <td>
                            <button
                                type="button"
                                className="removeFromCart"
                                onClick={() => removeFromCart(item.sessionId)}
                            >
                                Remove
                            </button>
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p>Items: <span id="cartQuantity">{cartData.totalQuantity}</span></p>
            <p>Total: $<span id="cartTotal">{Number(cartData.subtotal || 0).toFixed(2)}</span></p>
            {cartData.items.length > 0 && (
                <button type="button" id="clearCart" onClick={clearCart}>
                    Clear Cart
                </button>
            )}

            <hr />

            {/* Add or Update Session */}
            <h3>Add or Update Session</h3>
            <form id="productForm" onSubmit={handleSubmit}>
                <label htmlFor="productId">Product ID:</label>
                <input
                    type="number"
                    id="productId"
                    className={fieldClass("productId")}
                    value={form.productId}
                    onChange={handleChange}
                    required
                />
                <br /><br />

                <label htmlFor="productDescription">Description:</label>
                <input
                    type="text"
                    id="productDescription"
                    className={fieldClass("productDescription")}
                    value={form.productDescription}
                    onChange={handleChange}
                    required
                />
                <br /><br />

                <label htmlFor="productCategory">Category:</label>
                <input
                    type="text"
                    id="productCategory"
                    className={fieldClass("productCategory")}
                    value={form.productCategory}
                    onChange={handleChange}
                    required
                />
                <br /><br />

                <label htmlFor="productUnit">Unit of Measure:</label>
                <input
                    type="text"
                    id="productUnit"
                    className={fieldClass("productUnit")}
                    value={form.productUnit}
                    onChange={handleChange}
                    required
                />
                <br /><br />

                <label htmlFor="productPrice">Price:</label>
                <input
                    type="number"
                    id="productPrice"
                    className={fieldClass("productPrice")}
                    min="0"
                    step="0.01"
                    value={form.productPrice}
                    onChange={handleChange}
                    required
                />
                <br /><br />

                <button type="submit" id="addProduct">Add Session</button>
                <button type="button" id="updateProduct" onClick={handleUpdate}>
                    Update Session
                </button>
            </form>

            <p id="formMessage" className={formMessage.cls}>
                {formMessage.lines.map((line, i) => (
                    <span key={i}>
                        {line}
                        <br />
                    </span>
                ))}
            </p>

            <p id="apiMessage" className="text-danger">{apiMessage}</p>
        </div>
    );
}