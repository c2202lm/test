import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet, placeOrder } from '../../api';
import { Utensils } from "lucide-react";
import forkKnife from '../images/RecipeDetail/ForkKnife.png';
import { toast } from 'react-toastify';
import { getVouchers, getUserVouchers } from "../../api";

// Hàm tính discount an toàn
function calculateVoucherDiscount(voucher, subtotal) {
  if (!voucher) {
    console.log("❌ No voucher selected");
    return 0;
  }

  console.log("🔎 Checking voucher:", voucher);
  console.log("➡️ Subtotal:", subtotal);

  const minOrder = Number(voucher.minOrderValue || 0);
  if (subtotal < minOrder) {
    console.log(`❌ Subtotal (${subtotal}) < minOrderValue (${minOrder})`);
    return 0;
  }

  const value = Number(voucher.value || 0);
  if (!value) {
    console.log("❌ Voucher has no discount value (value=0)");
    return 0;
  }

  let discount = 0;

  if (voucher.type === "percent") {
    discount = (subtotal * value) / 100;
    if (voucher.maxDiscount != null && discount > voucher.maxDiscount) {
      console.log(
        `⚠️ Discount (${discount}) > maxDiscount (${voucher.maxDiscount}), capping`
      );
      discount = voucher.maxDiscount;
    }
  } else if (voucher.type === "fixed") {
    discount = value;
  } else {
    console.log("❌ Unknown voucher type:", voucher.type);
    return 0;
  }

  console.log("✅ Final discount:", discount);
  return Math.min(discount, subtotal);
}

export default function OrderForm({ setOrders }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const items = state?.items || [];

  const [allMeals, setAllMeals] = useState([]); 

  const addressSectionRef = useRef(null);
  const recipientSectionRef = useRef(null);

  const [address, setAddress] = useState(() => localStorage.getItem('order_address') || '');
  const [isEditing, setIsEditing] = useState(() => !localStorage.getItem('order_address'));
  const [addressError, setAddressError] = useState('');

  const [recipient, setRecipient] = useState(() => {
    try {
      const cached = localStorage.getItem('order_recipient');
      return cached ? JSON.parse(cached) : { name: '', phone: '', email: '' };
    } catch {
      return { name: '', phone: '', email: '' };
    }
  });
  const [isEditingRecipient, setIsEditingRecipient] = useState(() => {
    try {
      const cached = localStorage.getItem('order_recipient');
      if (!cached) return true;
      const parsed = JSON.parse(cached);
      return !parsed.name || !parsed.phone || !parsed.email;
    } catch {
      return true;
    }
  });
  const [recipientErrors, setRecipientErrors] = useState({ name: '', phone: '', email: '' });
  const [recipientError, setRecipientError] = useState('');

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState(() => {
    try {
      const cached = localStorage.getItem('user_vouchers');
      if (cached) return JSON.parse(cached);
    } catch { }
    return [];
  });
  const [selectedVoucher, setSelectedVoucher] = useState(() => {
    try {
      const cached = localStorage.getItem('selected_voucher');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  const [paymentMethod, setPaymentMethod] = useState(() => localStorage.getItem('order_payment_method') || 'cod');

  const [customerNote, setCustomerNote] = useState('');

  const shippingFee = Number(localStorage.getItem('shipping_fee') ?? 5);

  const itemsSubtotal = React.useMemo(() => {
    return Array.isArray(items)
      ? items.reduce((s, it) => s + Number(it.price ?? 0) * Number(it.quantity ?? 1), 0)
      : 0;
  }, [items]);

  // Fetch all meals when the component mounts
  useEffect(() => {
    const fetchAllMeals = async () => {
      try {
        const mealsData = await apiGet('meals');
        setAllMeals(mealsData);
      } catch (error) {
        console.error("Failed to fetch meals list:", error);
        toast.error("Could not load meal data. Please refresh the page.");
      }
    };
    fetchAllMeals();
  }, []);


  useEffect(() => {
    (async () => {
      const userId = state?.userId || localStorage.getItem('userId');
      if (!userId) { setIsEditingRecipient(true); return; }
      try {
        const data = await apiGet(`recipients/${encodeURIComponent(userId)}`);
        const next = {
          name: data?.name ?? '',
          phone: data?.phone ?? '',
          email: data?.email ?? '',
        };
        setRecipient(prev => {
          const merged = {
            name: prev.name || next.name,
            phone: prev.phone || next.phone,
            email: prev.email || next.email,
          };
          localStorage.setItem('order_recipient', JSON.stringify(merged));
          return merged;
        });
      } catch (err) {
        setIsEditingRecipient(true);
      }
    })();
  }, [state?.userId]);

  const onToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setAddressError('');
    } else {
      const errs = {};
      if (!address.trim()) {
        errs.address = "Please enter a shipping address.";
      } else if (address.trim().length < 5) {
        errs.address = "Address must be at least 5 characters.";
      }
      if (errs.address) {
        setAddressError(errs.address);
        return;
      }
      localStorage.setItem('order_address', address.trim());
      setIsEditing(false);
      setAddressError('');
    }
  };

  const validateRecipientFields = (r) => {
    const errs = { name: '', phone: '', email: '' };
    if (!r.name.trim()) {
      errs.name = "Please enter full name.";
    } else if (!/^[a-zA-Z\s]+$/.test(r.name.trim())) {
      errs.name = "Name can only contain letters.";
    } else if (r.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    }

    if (!r.phone.trim()) {
      errs.phone = "Please enter phone number.";
    } else if (!/^\+?\d{9,15}$/.test(r.phone.trim())) {
      errs.phone = "Invalid phone number format.";
    }

    if (!r.email.trim()) {
      errs.email = "Please enter email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())) {
      errs.email = "Invalid email address.";
    }

    return errs;
  };

  const onToggleEditRecipient = () => {
    if (!isEditingRecipient) {
      setIsEditingRecipient(true);
      setRecipientErrors({ name: '', phone: '', email: '' });
      setRecipientError('');
    } else {
      const errs = validateRecipientFields(recipient);
      const hasError = Object.values(errs).some(Boolean);
      if (hasError) {
        setRecipientErrors(errs);
        return;
      }
      localStorage.setItem('order_recipient', JSON.stringify(recipient));
      setIsEditingRecipient(false);
      setRecipientErrors({ name: '', phone: '', email: '' });
      setRecipientError('');
    }
  };
  
    useEffect(() => {
      const fetchVouchers = async () => {
      try {
      const token = localStorage.getItem("token");
      const raw = token
      ? await getUserVouchers(itemsSubtotal)
      : await getVouchers(itemsSubtotal);


      const arr = raw && Array.isArray(raw.data)
      ? raw.data
      : (Array.isArray(raw) ? raw : []);


      const vouchersWithEligibility = arr.map(v => ({
        ...v,
        type: v.discount_percent != null
          ? "percent"
          : v.discount_amount != null
          ? "fixed"
          : v.type?.toLowerCase(),
        value: v.discount_percent != null
          ? Number(v.discount_percent)
          : v.discount_amount != null
          ? Number(v.discount_amount)
          : 0,
        minOrderValue: Number(v.min_order_value ?? 0),
        maxDiscount: v.max_discount != null ? Number(v.max_discount) : undefined,
        isEligible: Number(itemsSubtotal) >= Number(v.min_order_value ?? 0),
      }));


      setVouchers(vouchersWithEligibility);
      localStorage.setItem("user_vouchers", JSON.stringify(vouchersWithEligibility));
      } catch (err) {
      console.error("Error fetching vouchers:", err);
      setVouchers([]);
      }
      };
      fetchVouchers();
    }, [itemsSubtotal]);


  // const discount = React.useMemo(() => {
  //   if (!selectedVoucher) return 0;
  //   const minOk = selectedVoucher.minOrderValue == null || itemsSubtotal >= Number(selectedVoucher.minOrderValue);
  //   if (!minOk) return 0;
  //   if (selectedVoucher.type === 'percent') {
  //     const d = (itemsSubtotal * Number(selectedVoucher.value || 0)) / 100;
  //     const capped = selectedVoucher.maxDiscount != null
  //       ? Math.min(d, Number(selectedVoucher.maxDiscount))
  //       : d;
  //     return Math.min(capped, itemsSubtotal);
  //   }
  //   if (selectedVoucher.type === 'fixed') {
  //     return Math.min(Number(selectedVoucher.value || 0), itemsSubtotal);
  //   }
  //   return 0;
  // }, [selectedVoucher, itemsSubtotal]);
  const discount = React.useMemo(() => calculateVoucherDiscount(selectedVoucher, itemsSubtotal), [selectedVoucher, itemsSubtotal]);
  const grandTotal = Math.max(0, itemsSubtotal - discount);
  const payableTotal = React.useMemo(() => grandTotal + shippingFee, [grandTotal, shippingFee]);

  const handleChooseVoucher = (v) => {
  //   const formattedVoucher = {
  //   ...v,
  //   type:
  //     v.type?.toLowerCase() === "percentage"
  //       ? "percent"
  //       : v.type?.toLowerCase() === "amount"
  //       ? "fixed"
  //       : v.type?.toLowerCase(),
  //   type: v.discount_percent != null
  //     ? "percent"
  //     : v.discount_amount != null
  //     ? "fixed"
  //     : v.type?.toLowerCase(),
  //   value: v.discount_percent != null
  //     ? Number(v.discount_percent)
  //     : v.discount_amount != null
  //     ? Number(v.discount_amount)
  //     : 0,
  //   minOrderValue: Number(v.min_order_value ?? 0),
  //   maxDiscount: v.max_discount != null ? Number(v.max_discount) : undefined,
  // };
  const formattedVoucher = {
  ...v,
  type: v.discount_percent != null
    ? "percent"
    : v.discount_amount != null
    ? "fixed"
    : v.type?.toLowerCase(),
  value: v.discount_percent != null
    ? Number(v.discount_percent)
    : v.discount_amount != null
    ? Number(v.discount_amount)
    : 0,
  minOrderValue: Number(v.min_order_value ?? 0),
  maxDiscount: v.max_discount != null ? Number(v.max_discount) : undefined,
  };

  //const voucherDiscount = calculateVoucherDiscount(formattedVoucher, itemsSubtotal);
  const voucherDiscount = calculateVoucherDiscount({
  ...v,
  type:
    v.discount_percent != null
      ? "percent"
      : v.discount_amount != null
      ? "fixed"
      : v.type?.toLowerCase(),
  value:
    v.discount_percent != null
      ? Number(v.discount_percent)
      : v.discount_amount != null
      ? Number(v.discount_amount)
      : 0,
  minOrderValue: Number(v.min_order_value ?? 0),
  maxDiscount: v.max_discount != null ? Number(v.max_discount) : undefined,
}, itemsSubtotal);


  console.log("🎟 Selected voucher:", formattedVoucher);
  setSelectedVoucher(formattedVoucher);
  localStorage.setItem('selected_voucher', JSON.stringify(formattedVoucher));
  setVoucherModalOpen(false);
  };

  const handleClearVoucher = () => {
    setSelectedVoucher(null);
    localStorage.removeItem('selected_voucher');
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to place an order. Redirecting to login...");
      setTimeout(() => {
        navigate('/login', { state: { from: location } });
      }, 2000);
      return;
    }

    if (isEditing || !address.trim()) {
      const message = isEditing ? 'Please confirm the address before placing the order.' : 'Please enter a delivery address.';
      toast.error(message);
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const recipientErrs = validateRecipientFields(recipient);
    if (isEditingRecipient || Object.values(recipientErrs).some(Boolean)) {
      const message = isEditingRecipient ? 'Please confirm recipient information before placing the order.' : 'Please check recipient information.';
      setRecipientErrors(recipientErrs);
      toast.error(message);
      recipientSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (allMeals.length === 0) {
      toast.error("Meal data is not loaded yet. Please wait a moment and try again.");
      return;
    }

    const itemsWithId = items.map(cartItem => {
      const mealFromDb = allMeals.find(meal => meal.name === cartItem.name);
      return {
        meal_id: mealFromDb ? mealFromDb.id : null,
        quantity: cartItem.quantity
      };
    });

    const invalidItem = itemsWithId.find(item => !item.meal_id);
    if (invalidItem) {
      console.error("Order failed: Could not find a database ID for an item.", { allItemsFromCart: items, allMealsFromDb: allMeals });
      toast.error("An error occurred with an item in your order. Please try removing it from the cart and adding it again.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: itemsWithId, 
        address,
        recipient,
        payment_method: paymentMethod,
        note: customerNote,
        voucher_id: selectedVoucher?.id || null,
      };

      console.log('Preparing to place order with data:', orderData);

      const result = await placeOrder(orderData);
      localStorage.setItem('order_address', address);
      localStorage.setItem('order_recipient', JSON.stringify(recipient));
      localStorage.setItem('order_payment_method', paymentMethod);
      localStorage.removeItem('selected_voucher');
      localStorage.removeItem('cartItems');


      toast.success(result.message || 'Order placed successfully!');
      
      navigate('/orders');

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to place order.';
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
    localStorage.setItem('order_payment_method', e.target.value);
  };

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className='fs-3 fw-bold mb-3'>Order Form</div>

      <section ref={addressSectionRef} className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="p-3 p-md-4 d-flex align-items-start gap-3">
            <div className="d-flex align-items-center gap-2 flex-shrink-0 py-1" style={{ whiteSpace: 'nowrap' }}>
              <span className="d-inline-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28, borderRadius: '50%', color: '#e03131' }} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5z" />
                </svg>
              </span>
              <span className="fw-semibold" style={{ color: '#e03131' }}>Shipping Address</span>
            </div>

            <div className="flex-grow-1 d-flex flex-column">
              <input
                type="text"
                className="form-control"
                style={{ backgroundColor: (isEditing || !address.trim()) ? '#fff' : '#f0f2f5' }}
                placeholder="Enter shipping address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-label="Shipping address"
                readOnly={!isEditing && address.trim() !== ''}
              />
              {addressError && <div className="text-danger small mt-1 text-start">{addressError}</div>}
            </div>

            {address.trim() && (
              <div className="flex-shrink-0 py-1">
                <button
                  type="button"
                  className="btn btn-sm p-0"
                  style={{ transition: 'all 0.2s ease-in-out', color: '#36B0C2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(43 137 151)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#36B0C2'}
                  onClick={onToggleEdit}
                  title={isEditing ? 'Confirm' : 'Edit'}
                >
                  {isEditing ? 'confirm' : 'edit'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>


      <section ref={recipientSectionRef} className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div className="p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <div className="d-flex align-items-center gap-2 flex-nowrap text-nowrap" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span className="d-inline-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, borderRadius: '50%', color: '#0b7285' }} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.91-8 5v1h16v-1c0-2.09-2.67-5-8-5z" />
                  </svg>
                </span>
                <span className="fw-semibold">Recipient Information</span>
              </div>

              {(recipient.name || recipient.phone || recipient.email) && (
                <button
                  type="button"
                  className="btn btn-sm p-0 py-1"
                  title="Go to Categories"
                  style={{ transition: 'all 0.2s ease-in-out', color: '#36B0C2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(43 137 151)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#36B0C2'}
                  onClick={onToggleEditRecipient}
                >
                  {isEditingRecipient ? 'confirm' : 'edit'}
                </button>
              )}
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ backgroundColor: isEditingRecipient ? '#fff' : '#f0f2f5' }}
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  readOnly={!isEditingRecipient}
                />
                {recipientErrors.name && <div className="text-danger small mt-1">{recipientErrors.name}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone number</label>
                <input
                  type="tel"
                  className="form-control"
                  style={{ backgroundColor: isEditingRecipient ? '#fff' : '#f0f2f5' }}
                  value={recipient.phone}
                  onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                  readOnly={!isEditingRecipient}
                />
                {recipientErrors.phone && <div className="text-danger small mt-1">{recipientErrors.phone}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  style={{ backgroundColor: isEditingRecipient ? '#fff' : '#f0f2f5' }}
                  value={recipient.email}
                  onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                  readOnly={!isEditingRecipient}
                />
                {recipientErrors.email && <div className="text-danger small mt-1">{recipientErrors.email}</div>}
              </div>
            </div>

            {recipientError && <div className="text-danger mt-2">{recipientError}</div>}
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div className="p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: '50%', color: '#d9480f' }} aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 7a2 2 0 0 1 2-2h5v3a2 2 0 1 0 0 4v3H5a2 2 0 0 1-2-2V7zm13 8h3a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3v3a2 2 0 1 1 0 4v3z" />
                  </svg>
                </span>
                <span className="fw-semibold">Voucher</span>
              </div>
              <button
                type="button"
                className="btn btn-link p-0 text-primary fw-semibold"
                onClick={() => setVoucherModalOpen(true)}
                title="Select voucher"
                aria-label="Select voucher"
              >
                +
              </button>
            </div>

            {selectedVoucher ? (
              <div className="mt-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-semibold">{selectedVoucher.title || selectedVoucher.code}</div>
                <div className="text-muted small">
                  {discount > 0
                    ? `Discount -$${discount.toFixed(2)} (${selectedVoucher.type === 'percent' ? `${selectedVoucher.value}%` : `$${Number(selectedVoucher.value).toFixed(2)}`})`
                    : 'Voucher not applicable'}
                </div>
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={handleClearVoucher}>Remove</button>
              </div>
            ) : (
              <div className="mt-3 text-muted">
                No voucher applied{vouchers.length ? '. Click + to choose.' : ''}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div className="p-3 p-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: '50%', color: '#1864ab' }} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2H2V6zm0 4h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8zm3 5h6v2H5v-2z" />
                </svg>
              </span>
              <span className="fw-semibold">Payment Method</span>
            </div>

            <div className="row g-2">
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={handlePaymentChange}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={handlePaymentChange}
                  />
                  <span>Credit/Debit Card</span>
                </label>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="ewallet"
                    checked={paymentMethod === 'ewallet'}
                    onChange={handlePaymentChange}
                  />
                  <span>E-wallet</span>
                </label>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-check d-flex align-items-center gap-2 border rounded p-2">
                  <input
                    type="radio"
                    className="form-check-input m-0"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={handlePaymentChange}
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {Array.isArray(items) && items.length > 0 && (
        <section className="mb-4">
          <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div className="p-3 p-md-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: '50%', color: '#0b7285' }} aria-hidden>
                    <span
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{ width: 28, height: 28, borderRadius: '50%', color: '#0b7285' }}
                      aria-hidden
                    >
                      <Utensils size={18} strokeWidth={2} />
                    </span>
                  </span>
                  <span className="fw-semibold">Dishes</span>
                </div>

                <button
                  type="button"
                  className="btn btn-sm p-0"
                  onClick={() => navigate('/categories')}
                  title="Go to Categories"
                  style={{ transition: 'all 0.2s ease-in-out', color: '#36B0C2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(43 137 151)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#36B0C2'}
                >
                  More Food!
                </button>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={`orderform-item-${idx}-${it.name ?? 'noname'}`}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {it.image && (
                              <img src={it.image} alt={it.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                            )}
                            <div>
                              <div className="fw-semibold">{it.name}</div>
                              {Array.isArray(it.diet) && it.diet.length > 0 && (
                                <div className="small text-muted">
                                  <img
                                    src={forkKnife}
                                    alt="Diet icon"
                                    className="me-1"
                                    style={{ width: '14px', height: '14px' }}
                                  />
                                  {it.diet.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{it.quantity ?? 1}</td>
                        <td className="text-end">${Number(it.price ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={2} className="text-end">Subtotal:</th>
                      <th className="text-end">${itemsSubtotal.toFixed(2)}</th>
                    </tr>
                    <tr>
                      <th colSpan={2} className="text-end">Shipping:</th>
                      <th className="text-end">${shippingFee.toFixed(2)}</th>
                    </tr>
                    <tr>
                      <th colSpan={2} className="text-end">Discount:</th>
                      <th className="text-end text-success">{discount > 0 ? `- $${discount.toFixed(2)}` : "$0.00"}</th>
                    </tr>
                    <tr>
                      <th colSpan={2} className="text-end">Total:</th>
                      <th className="text-end text-danger fw-bold">${payableTotal.toFixed(2)}</th>
                    </tr>

                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mb-4">
        <div className="border rounded bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div className="p-3 p-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="d-inline-flex align-items-center justify-content-center" style={{ width: 28, height: 28, borderRadius: '50%', color: '#5c940d' }} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM8 14H6v-2h2v2zm0-4H6V8h2v2zm10 4h-8v-2h8v2zm0-4h-8V8h8v2z" /></svg>
              </span>
              <span className="fw-semibold">Customer Note</span>
            </div>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Any special requests or notes for your order..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
          </div>
        </div>
      </section>

      {voucherModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1050 }}
          onClick={() => setVoucherModalOpen(false)}
        >
          <div
            className="bg-white rounded shadow p-3"
            style={{ width: 520, maxWidth: '90%', margin: '10vh auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="m-0">Choose voucher</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setVoucherModalOpen(false)}>Close</button>
            </div>
            {vouchers.length === 0 ? (
              <div className="text-muted">No available vouchers</div>
            ) : (
              <div className="list-group">
                {vouchers.map((v) => {
                  const normalizedVoucher = {
                    ...v,
                    type:
                      v.discount_percent != null
                        ? "percent"
                        : v.discount_amount != null
                        ? "fixed"
                        : v.type?.toLowerCase(),
                    value:
                      v.discount_percent != null
                        ? Number(v.discount_percent)
                        : v.discount_amount != null
                        ? Number(v.discount_amount)
                        : 0,
                    minOrderValue: Number(v.min_order_value ?? 0),
                    maxDiscount: v.max_discount != null ? Number(v.max_discount) : undefined,
                };

                const voucherDiscount = calculateVoucherDiscount(normalizedVoucher, itemsSubtotal);
                return(
                  <button
                    key={`voucher-${v.id || v.code}`}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedVoucher?.id === v.id || selectedVoucher?.code === v.code ? 'active' : ''}`}
                    onClick={() => handleChooseVoucher(v)}
                    disabled={v.isEligible === false}
                    title={
                      v.isEligible === false && normalizedVoucher.minOrderValue
                        ? `Requires minimum order $${normalizedVoucher.minOrderValue.toFixed(2)}`
                        : ""
                  }
                  >
                    <div className="text-start">
                      <div className="fw-semibold">{v.title || v.code}</div>
                      <div className="small">
                        {normalizedVoucher.type === "percent"
                          ? `Discount $${voucherDiscount.toFixed(2)} (${normalizedVoucher.value}%)`
                          : `Discount $${voucherDiscount.toFixed(2)}`}
                        {normalizedVoucher.minOrderValue
                          ? ` • Min $${normalizedVoucher.minOrderValue.toFixed(2)}`
                          : ""}
                      </div>

                    </div>
                    <span className={`badge ${v.isEligible === false ? 'bg-secondary' : 'bg-light text-dark'}`}>{v.isEligible === false ? 'Not eligible' : 'Select'}</span>
                  </button>
                )})}
              </div>
            )}
            {selectedVoucher && (
              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-outline-danger btn-sm" onClick={handleClearVoucher}>Remove voucher</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="d-flex gap-3 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary btn-lg flex-grow-1"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg flex-grow-1"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
