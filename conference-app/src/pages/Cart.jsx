import { Fragment, useEffect, useState } from "react";

const FIELDS = ["productId", "productDescription", "productCategory", "productUnit", "productPrice"];
const EMPTY_FORM = Object.fromEntries(FIELDS.map((f) => [f, ""]));

// returns an error message for one field, or "" if valid
function validateField(id, raw) {
    const value = raw.trim();
    const rexID = /^\d+$/;
    const rexDesc = /[A-Za-z0-9\s\-',.&:()]*$/;
    const rexAlphaNum = /^[a-zA-Z0-9\s]+$/;
    const rexPrice = /^[0-9]+(\.[0-9]{1,2})?$/;

    switch (id) {
        case "productId":
            if (value === "") return "Product ID is required.";
            if (!rexID.test(value)) return "Product ID must be a whole number greater than 0.";
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
            if (!rexAlphaNum.test(value)) return "Unit of Measure must be alphanumeric.";
            return "";
        case "productPrice":
            if (value === "") return "Price is required.";
            if (!rexPrice.test(value)) return "Price must be a valid number with at most 2 decimal places.";
            return "";
        default:
            return "";
    }
}

export default function Cart() {
    const [products, setProducts] = useState([]);   // raw data from sessions.json
    const [loaded, setLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const [cart, setCart] = useState([]);
    const [query, setQuery] = useState("");

    const [form, setForm] = useState(EMPTY_FORM);
    const [fieldState, setFieldState] = useState({}); // id -> "is-valid" | "is-invalid"
    const [formMessage, setFormMessage] = useState({ cls: "", lines: [] });

    const [apiMessage, setApiMessage] = useState("");

    // replaces $.getJSON("sessions.json")
    useEffect(() => {
        fetch("/sessions.json")
            .then((r) => {
                if (!r.ok) throw new Error("bad response");
                return r.json();
            })
            .then((data) => {
                setProducts(data);
                setLoaded(true);
            })
            .catch(() => {
                setLoadError(true);
                setLoaded(true);
            });
    }, []);

    // The sessions shown in "Available Sessions", built from sessions.json
    const sessions = products.map((p) => ({
        id: p.id,
        name: p.title,
        price: Number(p.price),
    }));

    /* ---------- cart ---------- */
    const inCart = (id) => cart.some((i) => i.id === id);
    const addToCart = (s) => {
        if (!inCart(s.id)) setCart([...cart, s]);
    };
    const removeFromCart = (id) => setCart(cart.filter((i) => i.id !== id));
    const total = cart.reduce((sum, i) => sum + i.price, 0);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        validateProductForm();
    };
    const handleUpdate = () => {
        validateProductForm();
    };

    const fieldClass = (id) => `form-control ${fieldState[id] || ""}`.trim();

    /* ---------- API ---------- */
    async function sendProducts() {
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(products),
            });
            if (!res.ok) throw new Error("bad response");
            setApiMessage("Products sent successfully!");
        } catch {
            setApiMessage("API not available yet.");
        }
    }

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
                {visibleSessions.map((s) => (
                    <Fragment key={s.id}>
                        <p>{s.name} - ${s.price}</p>
                        <button
                            className="addToCart"
                            disabled={inCart(s.id)}
                            onClick={() => addToCart(s)}
                        >
                            {inCart(s.id) ? "Added" : "Add to Cart"}
                        </button>
                    </Fragment>
                ))}

                {loadError && (
                    <p id="noResults" className="text-danger">Could not load sessions.json</p>
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
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody id="cartItems">
                    {cart.length === 0 && (
                        <tr>
                            <td colSpan="3" className="text-muted">Your cart is empty.</td>
                        </tr>
                    )}
                    {cart.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>
                                <button
                                    type="button"
                                    className="removeFromCart"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p>Total: $<span id="cartTotal">{total.toFixed(2)}</span></p>

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

            <button type="button" id="sendProducts" onClick={sendProducts}>
                Send Products to API
            </button>
            <p id="apiMessage">{apiMessage}</p>
        </div>
    );
}