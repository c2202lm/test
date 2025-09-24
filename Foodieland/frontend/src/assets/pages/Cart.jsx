import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Cart.css'

const Cart = ({ cartItems, removeFromCart, updateCartQuantity }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDiet, setSelectedDiet] = useState('all');
    const [filteredCartItems, setFilteredCartItems] = useState([]);
    const navigate = useNavigate();

    const [itemQuantities, setItemQuantities] = useState({});

    useEffect(() => {
        const filtered = cartItems.filter((item) => {
            const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDiet = selectedDiet === 'all' || (item.diet || []).some(d => d.toLowerCase() === selectedDiet.toLowerCase());
            return matchesSearch && matchesDiet;
        });
        setFilteredCartItems(filtered);
    }, [cartItems, searchTerm, selectedDiet]);

    useEffect(() => {
        const updatedQuantities = {};
        cartItems.forEach(item => {
            updatedQuantities[item.id] = item.quantity ?? 1;
        });
        setItemQuantities(updatedQuantities);
    }, [cartItems]);

    const handleQuantityChange = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;
        setItemQuantities(prev => ({
            ...prev,
            [cartId]: newQuantity
        }));
        try {
            await updateCartQuantity(cartId, newQuantity);
        } catch (err) {
            console.error("Lỗi cập nhật số lượng:", err);
        }
    };

    const uniqueDiets = [...new Set(cartItems.flatMap(item => item.diet || []))];

    const getDietBadgeStyles = (dietItem) => {
        const normalized = dietItem.toLowerCase().replace(/\s+/g, '-');
        const colorMap = {
            vegan: ['#e6f4ea', '#2c7a4b'],
            keto: ['#f3e8fd', '#7e57c2'],
            'gluten-free': ['#fff4e5', '#ef6c00'],
            paleo: ['#e1f5fe', '#0277bd'],
            'low-carb': ['#fdeaea', '#c62828'],
            vegetarian: ['#e7fbe9', '#388e3c'],
            'dairy-free': ['#f1f8e9', '#689f38'],
            'whole30': ['#e3f2fd', '#1565c0'],
        };
        const [bg, text] = colorMap[normalized] || ['#e0f7fa', '#00796b'];
        return { backgroundColor: bg, color: text };
    };

    const handleToggleSelect = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleBuySelected = () => {
        const orderDate = new Date().toISOString();
        const selectedOrders = selectedItems.map(title => {
            const item = cartItems.find(i => i.title === title);
            if (item) {
                return {
                    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    name: item.title,
                    image: item.image,
                    diet: item.diet,
                    price: item.price ?? 0,
                    quantity: itemQuantities[item.title] || 1,
                    shippingFee: 5,
                    status: "Pending Confirmation",
                    orderDate,
                };
            }
            return null;
        }).filter(Boolean);

        navigate('/order', { state: { items: selectedOrders } });
    };

    const calculateSelectedTotalPrice = () => {
        return selectedItems.reduce((total, id) => {
            const item = cartItems.find(i => i.id === id);
            const quantity = itemQuantities[id] || 1;
            const price = item?.price ?? 0;
            return total + price * quantity;
        }, 0).toFixed(2);
    };

    const [showRemove, setShowRemove] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    return (
        <div>
            <div className="bg-light p-5" style={{ minHeight: '100vh' }}>
                <div className="container">
                    <h2 className='fs-2 fw-bold mb-5'>Your Cart</h2>

                    <section className="mb-5 p-4 bg-white rounded-3 shadow-sm">
                        <h4 className="mb-4">Search and Filter</h4>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-8">
                                <input
                                    type="text"
                                    className="form-control rounded-pill px-4 py-2"
                                    placeholder="Search by dish name..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select rounded-pill px-4 py-2"
                                    value={selectedDiet}
                                    onChange={e => setSelectedDiet(e.target.value)}
                                >
                                    <option value="all">All Diets</option>
                                    {uniqueDiets.map((dietItem, idx) => (
                                        <option key={idx} value={dietItem.toLowerCase()}>
                                            {dietItem}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {filteredCartItems.length === 0 ? (
                        <div className="text-center p-5 bg-white rounded-3 shadow-sm">
                            <p className="lead text-muted">Your cart is empty!</p>
                            <p className="text-muted">
                                Find and add your dishes! <Link to="/categories" style={{ color: '#36B0C2', textDecoration: 'underline' }}>
                                    Go to Categories
                                </Link>
                            </p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredCartItems.map((item, idx) => {
                                const quantity = itemQuantities[item.id] ?? 1;
                                const total = (item.price ?? 10) * quantity;

                                return (
                                    <div className="col-12" key={idx}>
                                        <div className="d-flex flex-column flex-md-row p-4 align-items-center bg-white rounded-3 shadow-sm hover-scale-effect">
                                            <div className="d-flex align-items-center me-3">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    style={{ width: '20px', height: '20px' }}
                                                    checked={selectedItems.includes(item.title)}
                                                    onChange={() => handleToggleSelect(item.title)}
                                                />
                                            </div>

                                            <img src={item.image} alt={item.title} className="rounded-3 me-md-4 mb-3 mb-md-0"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover', flexShrink: 0 }} />

                                            <div className="flex-grow-1 text-md-start">
                                                <h5 className="fw-bold mb-2 fs-4">{item.title}</h5>
                                                <p className="text-muted mb-2">
                                                    Total Price: <span className="text-danger">${total.toFixed(2)}</span>
                                                </p>

                                                <div className="d-flex flex-wrap gap-2 mb-3">
                                                    {(item.diet || []).map((dietItem, i) => (
                                                        <span key={i} className="badge rounded-pill px-3 py-1"
                                                            style={getDietBadgeStyles(dietItem)}>
                                                            {dietItem}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="d-flex align-items-center gap-2">
                                                    <button
                                                        className="btn btn-outline-secondary px-3 py-1"
                                                        onClick={() =>
                                                            handleQuantityChange(item.id, Math.max(1, quantity - 1))
                                                        }
                                                    >−</button>
                                                    <input
                                                        type="number"
                                                        className="form-control text-center"
                                                        style={{ maxWidth: '80px', fontWeight: 'bold', borderRadius: '8px' }}
                                                        value={quantity}
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val) && val > 0) {
                                                                handleQuantityChange(item.id, val);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary px-3 py-1"
                                                        onClick={() => handleQuantityChange(item.id, quantity + 1)}
                                                    >+</button>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-column flex-md-row gap-2 mt-3 mt-md-0">
                                                <button
                                                    className="btn btn-danger rounded-pill px-4 py-2"
                                                    onClick={() => {
                                                        setItemToRemove(item);
                                                        setShowRemove(true);
                                                    }}
                                                >
                                                    <i className="bi bi-trash me-2"></i> Remove
                                                </button>

                                                <button
                                                    className="btn btn-primary rounded-pill px-4 py-2"
                                                    onClick={() => navigate(`/dish/${encodeURIComponent(item.title)}`)}
                                                >
                                                    <i className="bi bi-eye me-2"></i> View Dish
                                                </button>

                                                <button
                                                    className="btn btn-outline-secondary rounded-pill px-3"
                                                    onClick={() => {
                                                        const quantity = itemQuantities[item.title] || 1;
                                                        const singleOrder = [{
                                                            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                                                            name: item.title,
                                                            image: item.image,
                                                            diet: item.diet,
                                                            price: item.price,
                                                            quantity,
                                                            shippingFee: 5,
                                                            status: "Pending Confirmation",
                                                            orderDate: new Date().toISOString(),
                                                        }];
                                                        navigate('/order', { state: { items: singleOrder } });
                                                    }}
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {selectedItems.length > 0 && (
                <div className="buy-summary-bar-wrapper">
                    <div className="container d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                        <div className="d-flex flex-column">
                            <div className="form-check mb-1">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="selectAll"
                                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedItems(cartItems.map(item => item.id));
                                        } else {
                                            setSelectedItems([]);
                                        }
                                    }}
                                />
                                <label className="form-check-label fw-normal text-muted" htmlFor="selectAll">
                                    Select All
                                </label>
                            </div>
                        </div>

                        <div className="d-flex align-items-center flex-wrap gap-4">
                            <span className="fw-bold">Selected: {selectedItems.length}</span>

                            <span className="fw-bold">
                                Total Price: <span className="text-danger">${calculateSelectedTotalPrice()}</span>
                            </span>

                            <button
                                className="btn btn-danger rounded-pill px-4"
                                onClick={() => {
                                    const confirmed = window.confirm("Are you sure you want to remove selected items?");
                                    if (confirmed) {
                                        selectedItems.forEach(id => {
                                            const item = cartItems.find(i => i.id === id);
                                            if (item) removeFromCart(item);
                                        });
                                        setSelectedItems([]);
                                    }
                                }}
                            >
                                Remove
                            </button>

                            <button
                                className="btn btn-outline-secondary rounded-pill px-4"
                                onClick={handleBuySelected}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRemove && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>Are you sure you want to remove this item from the cart?</h4>
                        <div className="popup-btn">
                            <button
                                onClick={() => {
                                    if (itemToRemove) removeFromCart(itemToRemove);
                                    setItemToRemove(null);
                                    setShowRemove(false);
                                }}
                                className="popup-confirm"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => {
                                    setItemToRemove(null);
                                    setShowRemove(false);
                                }}
                                className="popup-remove"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )
            }


        </div>

    );
};

export default Cart;
