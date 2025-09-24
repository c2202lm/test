import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/RecipeCard.css';
import forkKnife from '../images/RecipeDetail/ForkKnife.png';
import CartIcon from '../images/Cart/Cart.svg';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const RecipeCard = ({
    id,
    image,
    title,
    description,
    time,
    diet,
    calories,
    price,
    favourites,
    addToFavourites,
    removeFromFavourites,
    addToOrders,
    cartItems,
    addToCart,
    removeFromCart
}) => {
    const recipeUrl = `/dish/${id}`;
    const isFavorite =
        favourites &&
        Array.isArray(favourites) &&
        favourites.some((favRecipe) => favRecipe.title === title);

    const isCartClicked = Array.isArray(cartItems) && cartItems.some(item => item.mealId === id);
    const [showQuantityPopup, setShowQuantityPopup] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [voucherModalOpen, setVoucherModalOpen] = useState(false);

    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(() => {
        try {
            const cached = localStorage.getItem('selected_voucher');
            return cached ? JSON.parse(cached) : null;
        } catch { return null; }
    });
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [pendingCartRecipe, setPendingCartRecipe] = useState(null);
    const [cartQuantity, setCartQuantity] = useState(1);

    const [recipesData, setRecipesData] = useState([]);
    const [selectedDiet, setSelectedDiet] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedAllergy, setSelectedAllergy] = useState('all');

    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const [allCategories, setAllCategories] = useState([]);
    const [categoryDisplayNames, setCategoryDisplayNames] = useState({});
    const [allAllergies, setAllAllergies] = useState([]);

    const [showSuccess, setShowSuccess] = useState(false);
    const [showRemove, setShowRemove] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const genOrderId = () =>
        (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentRecipe = { image, title, description, time, diet, calories };

        if (isFavorite) {
            removeFromFavourites(currentRecipe);
        } else {
            addToFavourites(currentRecipe);
        }
    };

    const handleBuyNowClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowQuantityPopup(true);
    };

    const handleConfirmQuantity = () => {
        const itemToOrder = {
            name: title,
            image,
            diet,
            price: parseFloat(price) || 0,
            quantity: parseInt(selectedQuantity) || 1,
        };
        setShowQuantityPopup(false);
        navigate('/order', {
            state: {
                items: [itemToOrder]
            }
        });
    };

    const handleAddToCartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCartClicked) {
            const cartItem = cartItems.find(c => c.mealId === id);
            if (cartItem) {
                setShowRemove(true);
            }
        } else {
            setPendingCartRecipe({ id, image, title, diet, price });
            setCartQuantity(1);
            setShowCartPopup(true);
        }
    };

    const handleCartConfirmQuantity = async () => {
        if (pendingCartRecipe) {
            const quantity = parseInt(cartQuantity) || 1;
            try {
                await addToCart({ id: pendingCartRecipe.id, quantity });
                setShowCartPopup(false);
                setPendingCartRecipe(null);
                setShowSuccess(true);
            } catch (err) {
                console.error("Lỗi thêm vào giỏ:", err);
                alert("Thêm giỏ hàng thất bại");
            }
        }
    };

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/meals', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                if (!res.ok) throw new Error('Failed to fetch meals');

                const data = await res.json();

                const formatted = data.map(meal => ({
                    id: meal.id,
                    title: meal.name || '',
                    description: meal.description || '',
                    calories: meal.calories || 0,
                    image: meal.image || '',
                    diet: meal.diet_types?.map(d => d.dietType) || [],
                    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.map(i => i.name) : [],
                    category: meal.meal_type?.mealType ? meal.meal_type.mealType.toLowerCase() : 'uncategd',
                    price: meal.price || 0,
                    allergies: meal.allergens?.map(a => a.allergen) || []
                }));

                setRecipesData(formatted);

                const CATEGORY_ORDER = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];

                const categoriesFromData = [...new Set(formatted.map(m => m.category))];

                const sortedCategories = categoriesFromData.sort((a, b) => {
                    const indexA = CATEGORY_ORDER.indexOf(a);
                    const indexB = CATEGORY_ORDER.indexOf(b);

                    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });

                setAllCategories(sortedCategories);

                const displayMap = {};
                sortedCategories.forEach(c => {
                    displayMap[c] = c.charAt(0).toUpperCase() + c.slice(1);
                });
                setCategoryDisplayNames(displayMap);

                const allergiesFromData = [...new Set(formatted.flatMap(m => m.allergies))];
                setAllAllergies(allergiesFromData);

            } catch (err) {
                console.error(err);
            }
        };

        fetchMeals();
    }, []);

    const cartButtonBackgroundColor = isCartClicked ? '#36b0c2' : '#f8f9fa';
    const cartIconFilter = isCartClicked ? 'brightness(0) invert(1)' : 'none';

    const shippingFee = Number(localStorage.getItem('shipping_fee') ?? 5);

    const subtotal = React.useMemo(() => {
        return (parseFloat(price) || 0) * (parseInt(selectedQuantity) || 1);
    }, [price, selectedQuantity]);

    const discount = React.useMemo(() => {
        if (!selectedVoucher) return 0;
        const minOk = selectedVoucher.minOrderValue == null || subtotal >= Number(selectedVoucher.minOrderValue);
        if (!minOk) return 0;
        if (selectedVoucher.type === 'percent') {
            const d = (subtotal * Number(selectedVoucher.value || 0)) / 100;
            const capped = selectedVoucher.maxDiscount != null ? Math.min(d, Number(selectedVoucher.maxDiscount)) : d;
            return Math.min(capped, subtotal);
        }
        if (selectedVoucher.type === 'fixed') {
            return Math.min(Number(selectedVoucher.value || 0), subtotal);
        }
        return 0;
    }, [selectedVoucher, subtotal]);

    const totalAfterVoucher = Math.max(0, subtotal - discount) + shippingFee;

    const handleChooseVoucher = (v) => {
        if (v.isEligible === false) {
            alert("This voucher is no longer available for you.");
            return;
        }
        setSelectedVoucher(v);
        localStorage.setItem('selected_voucher', JSON.stringify(v));
        setVoucherModalOpen(false);
    };

    const handleClearVoucher = () => {
        setSelectedVoucher(null);
        localStorage.removeItem('selected_voucher');
    };

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:8000/api/user/vouchers?subtotal=${subtotal}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch vouchers');
                const data = await res.json();

                const withFlag = Array.isArray(data)
                    ? data.map(v => {
                        const remainingGlobal = v.usage_limit != null ? Math.max(0, v.usage_limit - (v.used_count || 0)) : null;
                        const remainingUser = v.user_usage_limit != null ? Math.max(0, v.user_usage_limit - (v.user_used_count || 0)) : null;
                        const minOk = v?.minOrderValue == null || subtotal >= Number(v.minOrderValue);
                        const userOk = remainingUser == null || remainingUser > 0;
                        const globalOk = remainingGlobal == null || remainingGlobal > 0;
                        return {
                            ...v,
                            remaining_uses: remainingGlobal,
                            user_remaining_uses: remainingUser,
                            isEligible: minOk && userOk && globalOk,
                        };
                    })
                    : [];
                setVouchers(withFlag);
            } catch (err) {
                console.error(err);
                setVouchers([]);
            }
        };
        fetchVouchers();
    }, [subtotal]);

    const [voucherError, setVoucherError] = useState('');

    useEffect(() => {
        if (selectedVoucher) {
            const minOk = selectedVoucher.minOrderValue == null || subtotal >= Number(selectedVoucher.minOrderValue);
            if (!minOk) {
                setVoucherError(`Minimum order $${Number(selectedVoucher.minOrderValue).toFixed(2)} required for this voucher.`);
            } else {
                setVoucherError('');
            }
        } else {
            setVoucherError('');
        }
    }, [subtotal, selectedVoucher]);

    return (
        <>
            <Link
                to={recipeUrl}
                className="card h-100 border-0 shadow-sm dish-card text-decoration-none text-dark py-3"
            >
                <div className="position-relative">
                    <img src={image} className="card-img-top" alt={title} />
                    <button
                        className="favorite-button position-absolute top-0 end-0 m-2 btn btn-light rounded-circle"
                        onClick={handleFavoriteClick}
                    >
                        <i className={`bi ${isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                    </button>
                </div>
                <div className="card-body">
                    <h5 className="fw-semibold text-decoration-none text-black dish-card-title">
                        {title}
                    </h5>

                    {diet && (
                        <div className="d-flex align-items-center flex-wrap gap-1 mb-1 mt-2">
                            <img
                                src={forkKnife}
                                alt="Diet icon"
                                className="me-1"
                                style={{ width: '14px', height: '14px' }}
                            />

                            {Array.isArray(diet) &&
                                diet.map((dietItem, index) => {
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

                                    const [bgColor, textColor] = colorMap[normalized] || ['#e0f7fa', '#00796b'];

                                    return (
                                        <span
                                            key={index}
                                            className="badge rounded-pill px-2 py-1"
                                            style={{
                                                fontSize: '0.75rem',
                                                backgroundColor: bgColor,
                                                color: textColor,
                                            }}
                                        >
                                            {dietItem}
                                        </span>
                                    );
                                })}
                        </div>
                    )}

                    {description && (
                        <p className="text-muted small mt-1 mb-2">{description}</p>
                    )}

                    {price && (
                        <span className="fw-semibold text-danger dish-card-title">
                            ${parseFloat(price).toFixed(2)}
                        </span>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-1">
                        <button
                            className="btn btn-outline-secondary rounded-pill px-3 py-2 flex-grow-1 me-2"
                            onClick={handleBuyNowClick}
                        >
                            Buy Now
                        </button>
                        <button
                            className="btn rounded-circle"
                            onClick={handleAddToCartClick}
                            style={{
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.3s ease, filter 0.3s ease',
                                backgroundColor: cartButtonBackgroundColor,
                            }}
                            onMouseEnter={(e) => {
                                if (!isCartClicked) e.currentTarget.style.backgroundColor = '#e2e6ea';
                            }}
                            onMouseLeave={(e) => {
                                if (!isCartClicked) e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                        >
                            <img
                                src={CartIcon}
                                alt="Cart Icon"
                                style={{ width: '20px', height: '20px', filter: cartIconFilter }}
                            />
                        </button>
                    </div>
                </div>
            </Link>

            {showQuantityPopup && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
                    onClick={() => setShowQuantityPopup(false)}
                >
                    <div
                        className="bg-white p-0 rounded-4 shadow d-flex position-relative"
                        style={{ width: 900, maxWidth: '95vw', minHeight: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="btn btn-outline-secondary position-absolute"
                            style={{ top: 16, right: 16, borderRadius: '50%', width: 36, height: 36, padding: 0, fontSize: 20, lineHeight: 1 }}
                            onClick={() => setShowQuantityPopup(false)}
                            tabIndex={0}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <div style={{ flex: '0 0 50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src={image}
                                alt={title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderTopLeftRadius: 12,
                                    borderBottomLeftRadius: 12,
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0,
                                    background: '#fafafa'
                                }}
                            />
                        </div>
                        <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', overflowY: 'auto' }} className='pe-5'>
                            <div style={{ width: '100%', maxWidth: '500px' }}>
                                <div className="fw-bold mb-2" style={{ fontSize: 22 }}>{title}</div>
                                <div style={{ color: '#fa5230', fontWeight: 700, fontSize: 28, marginBottom: 12 }}>
                                    ${parseFloat(price).toFixed(2)}
                                </div>

                                <div className="d-flex gap-3 align-items-center mb-3">
                                    <div className="fw-semibold" style={{ fontSize: 16 }}>Quantity:</div>
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            className="btn btn-outline-secondary px-3 py-1"
                                            onClick={() => {
                                                const value = parseInt(selectedQuantity) || 1;
                                                setSelectedQuantity(Math.max(1, value - 1));
                                            }}
                                        >−</button>
                                        <input
                                            type="number"
                                            className="form-control text-center"
                                            style={{ maxWidth: 50, height: 30, fontWeight: 'bold', borderRadius: '8px' }}
                                            value={selectedQuantity}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    setSelectedQuantity('');
                                                } else {
                                                    const num = parseInt(value);
                                                    if (!isNaN(num) && num > 0) {
                                                        setSelectedQuantity(num);
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            className="btn btn-outline-secondary px-3 py-1"
                                            onClick={() => {
                                                const value = parseInt(selectedQuantity) || 1;
                                                setSelectedQuantity(value + 1);
                                            }}
                                        >+</button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="fw-semibold" style={{ fontSize: 16 }}>Voucher</div>
                                        <button
                                            type="button"
                                            className="btn-link p-0 fw-semibold bg-white small"
                                            style={{
                                                textDecoration: 'underline',
                                                color: '#36B0C2',
                                                transition: 'color 0.2s ease-in-out',
                                                border: 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(43 137 151)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#36B0C2'}
                                            onClick={() => setVoucherModalOpen(true)}
                                            title="Select voucher"
                                            aria-label="Select voucher"
                                        >
                                            {selectedVoucher ? 'Change' : 'Select Voucher'}
                                        </button>
                                    </div>
                                    <div className='border rounded-3 p-2 mt-2'>
                                        {selectedVoucher ? (
                                            <div className="mt-2 d-flex align-items-center justify-content-between">
                                                <div>
                                                    <div className="fw-semibold text-black">{selectedVoucher.title || selectedVoucher.code}</div>
                                                    <div className="text-success small">
                                                        {selectedVoucher.type === 'percent'
                                                            ? `Discount ${selectedVoucher.value}%`
                                                            : `Discount $${Number(selectedVoucher.value || 0).toFixed(2)}`}
                                                    </div>
                                                    {voucherError && (
                                                        <div className="small text-danger mt-1">{voucherError}</div>
                                                    )}
                                                </div>
                                                <span
                                                    className='small'
                                                    onClick={handleClearVoucher}
                                                    style={{
                                                        color: '#DC3545',
                                                        textDecoration: 'underline',
                                                        transition: 'color 0.2s ease-in-out',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#920614ff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#DC3545'}
                                                >
                                                    Remove
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-muted small">
                                                No voucher applied.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-1 text-muted">
                                    Subtotal: <span style={{ color: 'black' }}>${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="mb-0 text-muted">
                                    Shipping fee: <span style={{ color: 'black' }}>${shippingFee}</span>
                                </div>

                                {selectedVoucher && (
                                    <div className="text-muted">
                                        <p className='mt-1 mb-0'>
                                            <span className='text-muted'>Discount:</span>
                                            <span className='text-success'> -${discount.toFixed(2)}</span>
                                        </p>
                                    </div>
                                )}

                                <div className="mb-3 mt-2">
                                    <strong>Total: </strong>
                                    <span className="text-danger fw-semibold" style={{ fontSize: 20 }}>
                                        ${totalAfterVoucher.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 mt-auto w-100">
                                <button
                                    className="btn btn-lg buy-btn flex-grow-1"
                                    onClick={handleConfirmQuantity}
                                    disabled={!!voucherError}
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCartPopup && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
                >
                    <div className="bg-white p-4 rounded-4 shadow" style={{ width: '360px' }}>
                        <h5 className="fw-bold mb-3">
                            Select Quantity for
                            <p className='mt-1' style={{ color: "#36b0c2" }}>"{pendingCartRecipe?.title}"</p>
                        </h5>

                        <label className="form-label fw-semibold">Quantity</label>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <button
                                className="btn btn-outline-secondary px-3 py-1"
                                onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                            >
                                −
                            </button>

                            <input
                                type="number"
                                className="form-control text-center"
                                style={{ maxWidth: '150px', fontWeight: 'bold', borderRadius: '8px' }}
                                value={cartQuantity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const num = parseInt(val);
                                    if (!isNaN(num) && num > 0) {
                                        setCartQuantity(num);
                                    } else if (val === '') {
                                        setCartQuantity('');
                                    }
                                }}
                            />

                            <button
                                className="btn btn-outline-secondary px-3 py-1"
                                onClick={() => setCartQuantity(cartQuantity + 1)}
                            >
                                +
                            </button>
                        </div>

                        <div className="mb-3">
                            <strong>Total Price: </strong>
                            <span className="text-danger fw-semibold">
                                ${(parseFloat(pendingCartRecipe?.price || 0) * cartQuantity).toFixed(2)}
                            </span>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setShowCartPopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCartConfirmQuantity}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {voucherModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ background: 'rgba(0,0,0,0.4)', zIndex: 2000 }}
                    onClick={() => setVoucherModalOpen(false)}
                >
                    <div
                        className="bg-white rounded shadow p-3 position-relative"
                        style={{ width: 520, maxWidth: '90%', margin: '10vh auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="btn btn-outline-secondary position-absolute"
                            style={{
                                top: 9,
                                right: 11,
                                borderRadius: '50%',
                                width: 25,
                                height: 25,
                                padding: 0,
                                fontSize: 20,
                                lineHeight: 1
                            }}
                            onClick={() => setVoucherModalOpen(false)}
                            tabIndex={0}
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        <h5 className="m-0 mb-3">Choose voucher</h5>

                        {vouchers.length === 0 ? (
                            <div className="text-muted">No available vouchers</div>
                        ) : (
                            <div className="list-group">
                                {vouchers.map((v) => (
                                    <button
                                        key={`voucher-${v.id || v.code}`}
                                        type="button"
                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedVoucher?.id === v.id || selectedVoucher?.code === v.code ? 'active' : ''
                                            }`}
                                        onClick={() => handleChooseVoucher(v)}
                                        disabled={v.isEligible === false}
                                        title={
                                            v.isEligible === false
                                                ? v.user_remaining_uses === 0
                                                    ? 'You have reached the usage limit for this voucher'
                                                    : v.remaining_uses === 0
                                                        ? 'Voucher usage limit reached (global)'
                                                        : v.login_require && !localStorage.getItem('token')
                                                            ? 'Requires login'
                                                            : v.minOrderValue
                                                                ? `Requires minimum order $${Number(v.minOrderValue).toFixed(2)}`
                                                                : ''
                                                : ''
                                        }
                                    >
                                        <div className="text-start">
                                            <div className="fw-semibold">{v.title || v.code}</div>

                                            <div className="small">
                                                {v.type === 'percent'
                                                    ? `Discount ${Number(v.value || 0)}%`
                                                    : `Discount $${Number(v.value || 0).toFixed(2)}`}
                                                {v.minOrderValue ? ` • Min $${Number(v.minOrderValue).toFixed(2)}` : ''}
                                                {v.maxDiscount != null ? ` • Max $${Number(v.maxDiscount).toFixed(2)}` : ''}
                                            </div>

                                            {v.end_date && (
                                                <div className="small text-muted">
                                                    Expiry: {new Date(v.end_date).toLocaleDateString()}
                                                </div>
                                            )}

                                            {v.remaining_uses != null && (
                                                <div className="small text-muted">
                                                    Global remaining: {Math.max(0, v.remaining_uses)}
                                                </div>
                                            )}

                                            {v.user_usage_limit != null && (
                                                <div className="small text-muted">
                                                    You can use: {Math.max(0, v.user_usage_limit - (v.user_used_count || 0))} times left
                                                </div>
                                            )}

                                            {v.remaining_uses != null && (
                                                <div className="small text-muted">
                                                    Global remaining: {v.remaining_uses}
                                                </div>
                                            )}

                                            {v.user_remaining_uses != null && (
                                                <div className="small text-muted">
                                                    You can use: {v.user_remaining_uses} times left
                                                </div>
                                            )}
                                        </div>

                                        <span className={`badge ${v.isEligible === false ? 'bg-secondary' : 'bg-light text-dark'}`}>
                                            {v.isEligible === false ? 'Not eligible' : 'Select'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedVoucher && (
                            <div className="d-flex justify-content-end mt-3">
                                <p
                                    className='small'
                                    style={{
                                        color: '#DC3545',
                                        textDecoration: 'underline',
                                        transition: 'color 0.2s ease-in-out',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#920614ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#DC3545'}
                                    onClick={handleClearVoucher}
                                >
                                    Remove voucher
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>✅ Add too cart successfully!</h4>
                        <p>You has successfully add your dish to your cart</p>
                        <div className='popup-btn'>
                            <button onClick={() => setShowSuccess(false)} className="popup-confirm">Buy More</button>
                            <button onClick={() => navigate('/cart')} className="popup-confirm">Go to Cart</button>
                        </div>
                    </div>
                </div>
            )}

            {showRemove && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4> Are you sure to remove this dish from your cart ? </h4>
                        <div className='popup-btn'>
                            <button onClick={() => {
                                const cartItem = cartItems.find(c => c.mealId === id);
                                if (cartItem) removeFromCart(cartItem);
                                setShowRemove(false);
                            }} className="popup-confirm">Yes</button>
                            <button onClick={() => setShowRemove(false)} className="popup-remove">No</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecipeCard;