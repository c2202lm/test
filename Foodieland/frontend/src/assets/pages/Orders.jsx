import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import placeholderImage from '../images/RecipeDetail/RecipeNotFound.svg';
import forkKnife from '../images/RecipeDetail/ForkKnife.png';
import '../css/Orders.css';
import { getUserOrders, cancelOrder } from '../../api';
import { toast } from 'react-toastify';

const STATUS_TABS = [
    'Pending Confirmation',
    'Processing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
];

const Orders = () => {
    const [activeTab, setActiveTab] = useState('Pending Confirmation');
    const [orders, setOrders] = useState([]);
    const [viewOrder, setViewOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const navigate = useNavigate(); 

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedOrders = await getUserOrders();
            setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
        } catch (err) {
            setError('Failed to fetch orders. Please try again later.');
            toast.error(err.message || 'Failed to fetch orders.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        return Array.isArray(orders)
            ? orders.filter(order => order.status_ref && order.status_ref.label === activeTab)
            : [];
    }, [activeTab, orders]);

    const openCancelModal = useCallback((orderId) => {
        setCancelOrderId(orderId);
        setCancelModalOpen(true);
    }, []);

    const closeCancelModal = useCallback(() => {
        setCancelOrderId(null);
        setCancelModalOpen(false);
    }, []);

    const handleConfirmCancel = useCallback(async () => {
        if (!cancelOrderId) return;
        setIsCancelling(true);
        try {
            await cancelOrder(cancelOrderId);
            toast.success("Order cancelled successfully.");
            closeCancelModal();
            await fetchOrders();
        } catch (err) {
            toast.error(err.response?.message || "Failed to cancel order.");
        } finally {
            setIsCancelling(false);
        }
    }, [cancelOrderId, closeCancelModal, fetchOrders]);

    const handleReorder = (order) => {
        const items = (order.items || []).map(item => ({
            name: item.meal?.name,
            image: item.meal?.image,
            price: item.price,
            quantity: item.quantity,
            diet: item.meal?.diet_types?.map(d => d.dietType) || [],
        }));
        navigate('/order', { state: { items } });
    };

    if (isLoading) {
        return (
            <div className="container py-5 d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="container py-4 text-center text-danger"><h2>{error}</h2></div>;
    }

    const shippingFee = 5; 

    return (
        <div className="container py-4">
            <h1 className="mb-4">My Orders</h1>
            <ul className="nav nav-tabs nav-fill custom-modern-tabs">
                {STATUS_TABS.map(tab => (
                    <li className="nav-item" key={tab}>
                        <button
                            className={`custom-tab-button-modern ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    </li>
                ))}
            </ul>

            {filteredOrders.length > 0 ? (
                <div className="row g-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="col-12">
                            <div className="card order-card">
                                <div className="card-header">
                                    <div>
                                        <strong>Order ID:</strong> {order.id}
                                        <br />
                                        <small className="text-muted">Date: {new Date(order.order_date).toLocaleString()}</small>
                                    </div>
                                    {order.status_ref && (
                                        <span className="badge badge-status" style={{ backgroundColor: order.status_ref.color, color: 'white' }}>
                                            <i className={`bi bi-${order.status_ref.icon} me-1`}></i> {order.status_ref.label}
                                        </span>
                                    )}
                                </div>
                                <div className="card-body">
                                    {order.items?.map((item, itemIndex) => (
                                        <div key={item.id} className={`d-flex align-items-center gap-4 ${itemIndex > 0 ? 'mt-3 pt-3 border-top' : ''}`}>
                                            <img src={item.meal?.image || placeholderImage} alt={item.meal?.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                                            <div className="flex-grow-1">
                                                <div className="fw-bold fs-5">{item.meal?.name}</div>
                                                {item.meal?.diet_types?.length > 0 && (
                                                    <div className="d-flex align-items-center flex-wrap gap-1 mt-1">
                                                        <img src={forkKnife} alt="Diet icon" className="me-1" style={{ width: '14px', height: '14px' }} />
                                                        {item.meal.diet_types.map((diet) => {
                                                            const normalized = diet.dietType.toLowerCase().replace(/\s+/g, '-');
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
                                                                    key={diet.id}
                                                                    className="badge rounded-pill px-2 py-1"
                                                                    style={{
                                                                        fontSize: '0.75rem',
                                                                        backgroundColor: bgColor,
                                                                        color: textColor,
                                                                    }}
                                                                >
                                                                    {diet.dietType}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <div className="text-muted">Quantity: {item.quantity}</div>
                                                <div className="fw-bold total-price-item">Price: ${Number(item.price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <hr className="my-4" />
                                    <div className="order-summary">
                                        <div className="row-item">
                                            <span className="label">Subtotal</span>
                                            <span className="value">${(Number(order.total) + Number(order.discount_total)).toFixed(2)}</span>
                                        </div>
                                        {order.discount_total > 0 && (
                                            <div className="row-item text-success">
                                                <span className="label">Discount</span>
                                                <span className="value">-${Number(order.discount_total).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="row-item">
                                            <span className="label">Shipping</span>
                                            <span className="value">${shippingFee.toFixed(2)}</span>
                                        </div>
                                        <div className="row-item total">
                                            <span className="label">Total</span>
                                            <span className="value text-danger">${(Number(order.total) + shippingFee).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer d-flex justify-content-between align-items-center">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setViewOrder(order)}>
                                        View Info
                                    </button>
                                    {order.status_ref?.code === 'pending' && (
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => openCancelModal(order.id)}>
                                            Cancel Order
                                        </button>
                                    )}
                                    {order.status_ref?.label === 'Cancelled' && (
                                        <button
                                            className="btn btn-sm btn-outline-success" 
                                            onClick={() => handleReorder(order)}
                                        >
                                            Reorder
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="order-empty-state">
                    <p className="fs-5">No orders in this category.</p>
                </div>
            )}

            {viewOrder && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold">Order Details</h5>
                                <button type="button" className="btn-close" onClick={() => setViewOrder(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
                                    <div>
                                        <h6 className="mb-1 text-muted">Order Status</h6>
                                        {viewOrder.status_ref && (
                                            <span className="badge badge-status fs-6" style={{ backgroundColor: viewOrder.status_ref.color, color: 'white' }}>
                                                <i className={`bi bi-${viewOrder.status_ref.icon} me-1`}></i> {viewOrder.status_ref.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-end">
                                        <h6 className="mb-1 text-muted">Order ID</h6>
                                        <span className="font-monospace fw-bold">{viewOrder.id}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">Items in this Order</h6>
                                    <ul className="list-group list-group-flush order-item-list">
                                        {viewOrder.items?.map((item) => (
                                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                <div className="d-flex align-items-center">
                                                    <img src={item.meal?.image || placeholderImage} alt={item.meal?.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: '1rem' }} />
                                                    <div>
                                                        <div className="fw-bold">{item.meal?.name}</div>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="text-muted">x {item.quantity}</div>
                                                    <span className="fw-bold">${(item.quantity * item.price).toFixed(2)}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <hr />

                                <div className="row">
                                    <div className="col-md-6 mb-4 mb-md-0">
                                        <h6 className="fw-bold mb-3">Delivery Information</h6>
                                        <ul className="list-unstyled">
                                            <li className="d-flex align-items-start mb-2"><i className="bi bi-person-fill me-3 mt-1 text-primary"></i> <span>{viewOrder.recipient_info?.name || 'N/A'}</span></li>
                                            <li className="d-flex align-items-start mb-2"><i className="bi bi-telephone-fill me-3 mt-1 text-primary"></i> <span>{viewOrder.recipient_info?.phone || 'N/A'}</span></li>
                                            <li className="d-flex align-items-start mb-2"><i className="bi bi-geo-alt-fill me-3 mt-1 text-primary"></i> <span>{viewOrder.address || 'N/A'}</span></li>
                                            {viewOrder.note && <li className="d-flex align-items-start"><i className="bi bi-chat-left-text-fill me-3 mt-1 text-primary"></i> <span className="text-muted"><em>"{viewOrder.note}"</em></span></li>}
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-3">Payment Summary</h6>
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                <span>Subtotal</span>
                                                <span>${(Number(viewOrder.total) + Number(viewOrder.discount_total)).toFixed(2)}</span>
                                            </li>
                                            {viewOrder.discount_total > 0 && (
                                                <li className="list-group-item d-flex justify-content-between align-items-center px-0 text-success">
                                                    <span>Discount</span>
                                                    <span>-${Number(viewOrder.discount_total).toFixed(2)}</span>
                                                </li>
                                            )}
                                            <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                                <span>Shipping Fee</span>
                                                <span>${shippingFee.toFixed(2)}</span>
                                            </li>
                                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 fw-bold fs-5 border-top pt-3 mt-2">
                                                <span>Total</span>
                                                <span className='text-danger'>${(Number(viewOrder.total) + shippingFee).toFixed(2)}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel confirmation modal */}
            {cancelModalOpen && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Cancellation</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeCancelModal}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeCancelModal} disabled={isCancelling}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleConfirmCancel} disabled={isCancelling}>
                                    {isCancelling ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        'Confirm Cancel'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
