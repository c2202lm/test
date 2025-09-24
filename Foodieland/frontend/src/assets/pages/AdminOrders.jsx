import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { getAdminOrders, apiGet } from '../../api';
import '../css/AdminOrders.css';

export default function AdminOrders({ orders, setOrders, totalReturns = 0, setTotalReturns }) {
    const [orderPage, setOrderPage] = useState(1);
    const [viewOrder, setViewOrder] = useState(null);

    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState(null);
    const [dishes, setDishes] = useState([]);

    const ORDERS_PER_PAGE = 10;

    const statusColors = {
        "Pending Confirmation": "warning",
        "Preparing Food": "info",
        "Out for Delivery": "primary",
        "Delivered": "success"
    };

    useEffect(() => {
        const localOrders = localStorage.getItem('nutriplanner-orders');
        if (localOrders) {
            try {
                setOrders(JSON.parse(localOrders));
            } catch { }
        }
    }, []);

    useEffect(() => {
        if (orders) {
            localStorage.setItem('nutriplanner-orders', JSON.stringify(orders));
        }
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchStatus = filterStatus === 'all' || order.status === filterStatus;
            const matchDate =
                !filterDate ||
                (order.orderDate &&
                    format(new Date(order.orderDate), 'dd-MM-yyyy') === format(filterDate, 'dd-MM-yyyy'));
            return matchStatus && matchDate;
        });
    }, [orders, filterStatus, filterDate]);

    const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

    const pagedOrders = [...filteredOrders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE);

    const handleConfirmOrder = (orderId) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? { ...order, status: "Preparing Food" }
                    : order
            )
        );
    };

    const handleShipOrder = (orderId) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? { ...order, status: "Out for Delivery" }
                    : order
            )
        );
    };

    const handleMarkDelivered = (orderId) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId
                    ? { ...order, status: "Delivered" }
                    : order
            )
        );
    };

    const getOrderDisplayDetails = (order) => {
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            const firstItemName = order.items[0].name;
            const extraItemsCount = order.items.length - 1;
            return {
                name: `${firstItemName}${extraItemsCount > 0 ? ` (+${extraItemsCount} more)` : ''}`,
                total: (order.total || 0) + (order.shippingFee || 0)
            };
        }
        return {
            name: order.name || 'N/A',
            total: (Number(order.price || 0) * Number(order.quantity || 1)) + (order.shippingFee || 0)
        };
    };

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'Pending Confirmation', label: 'Pending Confirmation' },
        { value: 'Preparing Food', label: 'Preparing Food' },
        { value: 'Out for Delivery', label: 'Out for Delivery' },
        { value: 'Delivered', label: 'Delivered' }
    ];

    return (
        <div className="container py-4" style={{ maxWidth: 1200 }}>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Orders Management</h2>
            </div>

            <section className="mb-4 p-4 bg-light rounded-3 shadow-sm filter-section">
                <div className="row g-4 align-items-end">
                    <div className="col-md-6 d-flex flex-column">
                        <label htmlFor="filterDate" className="form-label">Order Date</label>
                        <DatePicker
                            id="filterDate"
                            className="form-control rounded-5 px-4 py-2"
                            selected={filterDate}
                            onChange={date => { setFilterDate(date); setOrderPage(1); }}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select date"
                            isClearable
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="filterStatus" className="form-label">Order Status</label>
                        <select
                            className="form-select rounded-5 px-4 py-2"
                            id="filterStatus"
                            value={filterStatus}
                            onChange={e => { setFilterStatus(e.target.value); setOrderPage(1); }}
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <div className="row g-3 mb-4">
                <div className="col-12">
                    <div className="p-4 rounded-3 bg-white border">
                        <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Orders Management</h5>
                        <div className="table-responsive">
                            <table className="table align-middle mb-0" style={{ tableLayout: "fixed", width: "100%" }}>
                                <thead>
                                    <tr>
                                        <th className="text-center" style={{ minWidth: 120 }}>Order ID</th>
                                        <th className="text-center" style={{ minWidth: 180 }}>Customer</th>
                                        <th className="text-center" style={{ minWidth: 160 }}>Order Date</th>
                                        <th className="text-center" style={{ minWidth: 200 }}>Items</th>
                                        <th className="text-center" style={{ minWidth: 120 }}>Total</th>
                                        <th className="text-center" style={{ minWidth: 150 }}>Status</th>
                                        <th className="text-center" style={{ minWidth: 240 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center text-muted py-4">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                    {pagedOrders.map(order => (
                                        <tr key={order.id}>
                                            <td className="text-center">
                                                <span className="admin-orders-ellipsis" title={order.id}>
                                                    {order.id}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="fw-bold admin-orders-ellipsis" title={order.customerName || order.customer || 'N/A'}>
                                                    {order.customerName || order.customer || 'N/A'}
                                                </div>
                                                <br />
                                                <div className="small text-muted admin-orders-ellipsis" title={order.phone}>
                                                    {order.phone}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {order.orderDate ? format(new Date(order.orderDate), 'dd-MM-yyyy HH:mm') : 'N/A'}
                                            </td>
                                            <td className="text-center">{getOrderDisplayDetails(order).name}</td>
                                            <td className="text-center">
                                                ${getOrderDisplayDetails(order).total.toFixed(2)}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge bg-${statusColors[order.status] || 'secondary'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d- flex gap-2 justify-content-center admin-orders-actions">
                                                    {order.status === "Pending Confirmation" && (
                                                        <button
                                                            className={`btn btn-sm btn-outline-${statusColors["Pending Confirmation"]}`}
                                                            onClick={() => handleConfirmOrder(order.id)}
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}
                                                    {order.status === "Preparing Food" && (
                                                        <button
                                                            className={`btn btn-sm btn-outline-${statusColors["Preparing Food"]}`}
                                                            onClick={() => handleShipOrder(order.id)}
                                                        >
                                                            Ship
                                                        </button>
                                                    )}
                                                    {order.status === "Out for Delivery" && (
                                                        <button
                                                            className={`btn btn-sm btn-outline-${statusColors["Out for Delivery"]}`}
                                                            onClick={() => handleMarkDelivered(order.id)}
                                                        >
                                                            Delivered
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => setViewOrder(order)}
                                                    >
                                                        View
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-dark">
                                                        Track
                                                    </button>
                                                </div>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalOrderPages > 1 && (
                            <div className="d-flex justify-content-end mt-3">
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item${orderPage === 1 ? ' disabled' : ''}`}>
                                            <button className="page-link bg-white fs-4" style={{ border: 'none' }} onClick={() => setOrderPage(orderPage - 1)}>&laquo;</button>
                                        </li>
                                        {Array.from({ length: totalOrderPages }, (_, idx) => (
                                            <li key={idx + 1} className={`page-item${orderPage === idx + 1 ? ' active' : ''}`}>
                                                <button className="page-link" onClick={() => setOrderPage(idx + 1)}>
                                                    {idx + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item${orderPage === totalOrderPages ? ' disabled' : ''}`}>
                                            <button className="page-link bg-white fs-4" style={{ border: 'none' }} onClick={() => setOrderPage(orderPage + 1)}>&raquo;</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {viewOrder && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.18)',
                        zIndex: 3000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={() => setViewOrder(null)}
                >

                    <div
                        className="bg-white rounded-3 shadow p-4"
                        style={{
                            minWidth: 1200,
                            maxWidth: '95vw',
                            display: 'flex',
                            gap: 32,
                            minHeight: 500,
                            maxHeight: '60vh'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="delivery-details-left">
                            <h5 className="fw-bold mb-3">Delivery details</h5>
                            <div className="mb-3">
                                <label className="form-label mb-1">Name</label>
                                <input className="form-control" value={viewOrder.customerName || viewOrder.customer || ''} readOnly />
                            </div>
                            <div className="mb-3">
                                <label className="form-label mb-1">Contact Number</label>
                                <input className="form-control" value={viewOrder.phone || ''} readOnly />
                            </div>
                            <div className="mb-3">
                                <label className="form-label mb-1">Delivery Address</label>
                                <textarea className="form-control" value={viewOrder.address || ''} readOnly />
                            </div>
                            <div className="mb-3">
                                <label className="form-label mb-1">Customer Note</label>
                                <textarea className="form-control" value={viewOrder.message || ''} readOnly />
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '90vh', paddingRight: 8 }}>
                            {(() => {
                                const modalItems = Array.isArray(viewOrder.items) && viewOrder.items.length > 0
                                    ? viewOrder.items.map(it => ({
                                        image: it.image,
                                        name: it.meal_name || it.name,
                                        price: Number(it.price) || 0,
                                        quantity: Number(it.quantity) || 0,
                                    }))
                                    : [{
                                        image: viewOrder.image,
                                        name: viewOrder.name,
                                        price: Number(viewOrder.price) || 0,
                                        quantity: Number(viewOrder.quantity) || 0,
                                    }];

                                const modalTotal = modalItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

                                return (
                                    <>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th className='text-center align-middle'>Image</th>
                                                    <th className='text-center align-middle'>Name</th>
                                                    <th className='text-center align-middle'>Price</th>
                                                    <th className='text-center align-middle'>Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalItems.map((it, idx) => (
                                                    <tr key={idx}>
                                                        <td className='text-center align-middle'>{it.image && <img src={it.image} alt={it.name} style={{ width: 60, borderRadius: 6 }} />}</td>
                                                        <td className='text-center align-middle'>{it.name || 'N/A'}</td>
                                                        <td className='text-center align-middle'>{it.price.toFixed(2)}$</td>
                                                        <td className='text-center align-middle'>{it.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="fw-bold fs-5 mb-2 text-end">
                                            Total price: <span className='text-danger'>{modalTotal.toFixed(2)}$</span>
                                        </div>
                                    </>
                                );
                            })()}

                            <div className="d-flex flex-column gap-2 mt-4">
                                <div><b>Order placed at :</b> {viewOrder.orderDate ? new Date(viewOrder.orderDate).toLocaleString() : 'N/A'}</div>
                                <div><b>Tracking Number :</b> {viewOrder.trackingNumber || 'N/A'}</div>
                                <div>
                                    <b>Order Status :</b>{' '}
                                    <span className={`badge bg-${statusColors[viewOrder.status] || 'secondary'}`} style={{ fontSize: 14 }}>
                                        {viewOrder.status}
                                    </span>
                                </div>
                                <div><b>Payment Mode :</b> {viewOrder.paymentMode || 'Visa'}</div>
                                <div><b>Payment Status :</b> {viewOrder.paymentStatus || 'Pending'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
