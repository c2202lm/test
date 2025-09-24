import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { getOrderPayableTotal } from '../../utils/orderUtils'; // Import the helper
import "../css/AdminDashboard.css";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashBoard({ orders = [], setOrders, totalReturns = 0, setTotalReturns, totalCustomers = 0 }) {
    useEffect(() => {
        const localOrders = localStorage.getItem('nutriplanner-orders');
        if (localOrders) {
            try {
                setOrders(JSON.parse(localOrders));
            } catch { }
        }
        // getAdminDashboard()
        //     .then(data => {
        //         if (data.orders && data.orders.length > 0) {
        //             setOrders(data.orders);
        //             localStorage.setItem('orders', JSON.stringify(data.orders));
        //         }
        //     })
        //     .catch(err => console.error("Lỗi lấy dashboard:", err));
    }, [setOrders]);

    useEffect(() => {
        if (Array.isArray(orders)) {
            localStorage.setItem('nutriplanner-orders', JSON.stringify(orders));
        }
    }, [orders]);

    const pendingOrders = orders.filter(order => order.status === "Pending Confirmation");

    const confirmedOrders = useMemo(
        () => orders.filter(order =>
            order.status === "Preparing Food" ||
            order.status === "Out for Delivery" ||
            order.status === "Delivered"
        ),
        [orders]
    );

    const totalConfirmedOrderIds = useMemo(() => new Set(confirmedOrders.map(o => o.id)), [confirmedOrders]);

    const totalRevenue = React.useMemo(() => {
        return confirmedOrders.reduce((sum, order) => sum + getOrderPayableTotal(order), 0);
    }, [confirmedOrders]);

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

    // Tính doanh thu từng tháng trong năm hiện tại
    const monthlyRevenue = Array(12).fill(0);
    confirmedOrders.forEach(order => {
        const date = new Date(order.orderDate);
        if (date.getFullYear() === new Date().getFullYear()) {
            const month = date.getMonth();
            monthlyRevenue[month] += getOrderPayableTotal(order);
        }
    });

    const monthLabels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Tính doanh thu hôm nay và tuần này
    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Chủ nhật đầu tuần

    let revenueToday = 0;
    let revenueThisWeek = 0;

    confirmedOrders.forEach(order => {
        const date = new Date(order.orderDate);
        const orderRevenue = getOrderPayableTotal(order);

        if (date.toLocaleDateString() === todayStr) {
            revenueToday += orderRevenue;
        }
        if (date >= startOfWeek && date <= now) {
            revenueThisWeek += orderRevenue;
        }
    });

    // Tính doanh thu năm hiện tại
    let revenueThisYear = 0;
    confirmedOrders.forEach(order => {
        const date = new Date(order.orderDate);
        if (date.getFullYear() === now.getFullYear()) {
            revenueThisYear += getOrderPayableTotal(order);
        }
    });

    const [orderPage, setOrderPage] = useState(1);
    const ORDERS_PER_PAGE = 10;

    const pagedOrders = [...orders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE);

    const [dishes, setDishes] = useState([]);

    // useEffect(() => {
    //     apiGet('admin/meals').then(setDishes).catch(() => setDishes([]));
    // }, []);

    // Gỡ bỏ effect này vì nó gọi API và có nhánh setOrders([]) => làm mất dữ liệu local
    // React.useEffect(() => {
    //     if (!setOrders) return;
    //     (async () => {
    //         try {
    //             const data = await getAdminOrders();
    //             if (Array.isArray(data)) {
    //                 setOrders(data);
    //             } else if (data && Array.isArray(data.orders)) {
    //                 setOrders(data.orders);
    //             } else {
    //                 setOrders([]);
    //             }
    //         } catch (e) {
    //             console.error("❌ Load admin orders failed:", e.message);
    //             if (e.message.includes("Unauthenticated") || e.message.includes("401")) {
    //                 window.location.href = "/login";
    //             }
    //         }
    //     })();
    // }, [setOrders]);

    const [searchTerm, setSearchTerm] = useState("");

    const mapStatus = (status) => {
        switch (status) {
            case "Pending Confirmation": return "Pending";
            case "Preparing Food": return "Preparing";
            case "Out for Delivery": return "Shipping";
            case "Delivered": return "Delivered";
            case "Cancelled": return "Cancelled";
            default: return status;
        }
    };

    const filteredOrders = pagedOrders.filter(order =>
        order.id.toString().includes(searchTerm.toLowerCase()) ||
        mapStatus(order.status).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderDate && new Date(order.orderDate).toLocaleDateString('en-GB').includes(searchTerm)) ||
        getOrderPayableTotal(order).toFixed(2).includes(searchTerm)
    );

    return (
        <div className="container py-4" style={{ maxWidth: 1200 }}>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Dashboard</h2>
            </div>


            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="p-3 rounded-3 bg-white border d-flex flex-column">
                        <span className="text-muted" style={{ fontSize: 15 }}>Total customers</span>
                        <span className="fw-bold" style={{ fontSize: 24, color: '#36b0c2' }}>
                            {Number(totalCustomers).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3 rounded-3 bg-white border d-flex flex-column">
                        <span className="text-muted" style={{ fontSize: 15 }}>Total revenue</span>
                        <span className="fw-bold" style={{ fontSize: 24, color: '#36b0c2' }}>
                            ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3 rounded-3 bg-white border d-flex flex-column">
                        <span className="text-muted" style={{ fontSize: 15 }}>Total orders</span>
                        <span className="fw-bold" style={{ fontSize: 24, color: '#36b0c2' }}>
                            {totalConfirmedOrderIds.size}
                        </span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3 rounded-3 bg-white border d-flex flex-column">
                        <span className="text-muted" style={{ fontSize: 15 }}>Total returns</span>
                        <span className="fw-bold" style={{ fontSize: 24, color: '#36b0c2' }}>
                            {totalReturns.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>


            {/* Order History & Top Customers */}
            <div className="row g-3 mb-4">
                <div className="col-lg-9 col-12">
                    <div className="p-4 rounded-4 bg-beige border" style={{ border: "none" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Order History</h5>
                                <span className="text-muted" style={{ fontSize: 15 }}>May - June, {new Date().getFullYear()}</span>
                            </div>
                            <div className="input-group" style={{ maxWidth: 220 }}>

                                <span>
                                    <i className="bi bi-search" style={{
                                        position: "absolute",
                                        left: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#6c757d"
                                    }}
                                    ></i>
                                    <input
                                        type="text"
                                        className="form-control border-2 bg-transparent ps-5"
                                        placeholder="Search"
                                        style={{ fontSize: 15 }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-custom align-middle mb-0" style={{ background: "transparent" }}>
                                <thead style={{ display: "" }}>
                                    <tr>
                                        <th style={{ fontSize: 15, color: "#888" }}>Order ID</th>
                                        <th style={{ fontSize: 15, color: "#888" }}>Status</th>
                                        <th style={{ fontSize: 15, color: "#888" }}>Total</th>
                                        <th style={{ fontSize: 15, color: "#888" }}>Date</th>
                                        <th style={{ fontSize: 15, color: "#888" }}>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-4">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} style={{ background: "transparent" }}>
                                            <td style={{ border: "none", fontWeight: 500, fontSize: 16, color: "#2c3e50" }}>
                                                #{order.id}
                                            </td>
                                            <td style={{ border: "none" }}>
                                                {order.status === "Delivered" && (
                                                    <span className="badge rounded-pill bg-success px-3 py-2" style={{ fontSize: 15 }}>
                                                        <i className="bi bi-check2-circle me-1"></i> Delivered
                                                    </span>
                                                )}
                                                {order.status === "Cancelled" && (
                                                    <span className="badge rounded-pill bg-purple px-3 py-2" style={{ fontSize: 15, background: "#c7a7e9", color: "#2c3e50" }}>
                                                        <i className="bi bi-x-circle me-1"></i> Cancelled
                                                    </span>
                                                )}
                                                {order.status === "Pending Confirmation" && (
                                                    <span className="badge rounded-pill bg-warning px-3 py-2" style={{ fontSize: 15 }}>
                                                        <i className="bi bi-clock me-1"></i> Pending
                                                    </span>
                                                )}
                                                {order.status === "Preparing Food" && (
                                                    <span className="badge rounded-pill bg-info px-3 py-2" style={{ fontSize: 15 }}>
                                                        <i className="bi bi-egg-fried me-1"></i> Preparing
                                                    </span>
                                                )}
                                                {order.status === "Out for Delivery" && (
                                                    <span className="badge rounded-pill bg-primary px-3 py-2" style={{ fontSize: 15 }}>
                                                        <i className="bi bi-truck me-1"></i> Shipping
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ border: "none", fontWeight: 500, fontSize: 16, color: "#2c3e50" }}>
                                                ${getOrderPayableTotal(order).toFixed(2)}
                                            </td>
                                            <td style={{ border: "none", fontWeight: 500, fontSize: 16, color: "#2c3e50" }}>
                                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB') : "N/A"}
                                            </td>
                                            <td style={{ border: "none", fontWeight: 500, fontSize: 16, color: "#2c3e50" }}>
                                                {order.orderDate ? new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Top Customers */}
                <div className="col-lg-3 col-12">
                    <div className="p-4 rounded-4 bg-white border h-100">
                        <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>
                            <i className="bi bi-star-fill text-warning me-2"></i>
                            Top Customers
                        </h5>
                        <table className="table table-borderless mb-0">
                            <thead>
                                <tr>
                                    <th style={{ fontSize: 15, color: "#888" }}>#</th>
                                    <th style={{ fontSize: 15, color: "#888" }}>Name</th>
                                    <th style={{ fontSize: 15, color: "#888" }}>Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    (() => {
                                        // Tính tổng tiền từng khách hàng
                                        const customerMap = {};
                                        confirmedOrders.forEach(order => {
                                            if (order.customerName && order.customerName !== 'N/A') {
                                                const spent = getOrderPayableTotal(order);
                                                if (!customerMap[order.customerName]) {
                                                    customerMap[order.customerName] = { spent: 0, count: 0 };
                                                }
                                                customerMap[order.customerName].spent += spent;
                                                customerMap[order.customerName].count += 1;
                                            }
                                        });
                                        // Sắp xếp theo số tiền trả giảm dần
                                        const topCustomers = Object.entries(customerMap)
                                            .sort((a, b) => b[1].spent - a[1].spent)
                                            .slice(0, 5);

                                        return topCustomers.map(([name, data], idx) => (
                                            <tr key={name}>
                                                <td>
                                                    <span className={`badge rounded-pill ${idx === 0 ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
                                                        {idx === 0 ? <i className="bi bi-trophy-fill me-1"></i> : null}
                                                        Top {idx + 1}
                                                    </span>
                                                </td>
                                                <td
                                                    className="truncate-text"
                                                    style={{ fontWeight: 500, color: "#2c3e50" }}
                                                    title={name}
                                                >
                                                    {name}
                                                </td>
                                                <td style={{ fontWeight: 500, color: "#36b0c2" }}>${data.spent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ));
                                    })()
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Most Ordered Items */}
            <div className="mt-4">
                <div className="p-4 rounded-3 bg-white border">
                    <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Most Ordered Items</h5>
                    <div className="row mt-3 g-3">
                        {
                            (() => {
                                const orderCountMap = {};
                                orders.forEach(order => {
                                    if (order.items && Array.isArray(order.items)) {
                                        order.items.forEach(item => {
                                            if (!orderCountMap[item.name]) {
                                                orderCountMap[item.name] = { count: 0, image: item.image };
                                            }
                                            orderCountMap[item.name].count += item.quantity;
                                        });
                                    }
                                    // Xử lý đơn hàng phẳng (từ RecipeCard)
                                    else if (order.name) {
                                        if (!orderCountMap[order.name]) {
                                            orderCountMap[order.name] = { count: 0, image: order.image };
                                        }
                                        orderCountMap[order.name].count += order.quantity;
                                    }
                                });

                                const topItems = Object.entries(orderCountMap)
                                    .sort((a, b) => b[1].count - a[1].count)
                                    .slice(0, 5);

                                if (topItems.length === 0) {
                                    return <p className="text-muted">No items have been ordered yet.</p>;
                                }

                                return topItems.map(([name, data]) => (
                                    <div key={name} className="col">
                                        <div className="card h-100">
                                            <img src={data.image} className="card-img-top" alt={name} style={{ height: '150px', objectFit: 'cover' }} />
                                            <div className="card-body">
                                                <h6 className="card-title text-truncate">{name}</h6>
                                                <p className="card-text">Ordered: <strong>{data.count}</strong> times</p>
                                            </div>
                                        </div>
                                    </div>
                                ));
                            })()
                        }
                    </div>
                </div>
            </div>
        </div >
    );
}
