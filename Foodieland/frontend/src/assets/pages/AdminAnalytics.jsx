import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { getOrderPayableTotal } from '../../utils/orderUtils'; // Import the helper

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

export default function AdminAnalytics({ orders = [], setOrders, totalReturns = 0, setTotalReturns }) {
    const [analytics, setAnalytics] = useState({});
    const [dishes, setDishes] = useState([]);

    useEffect(() => {
        const localOrders = localStorage.getItem('nutriplanner-orders');
        if (localOrders) {
            try {
                setOrders(JSON.parse(localOrders));
            } catch {}
        }
        // getAdminAnalytics()
        //     .then(data => {
        //         if (data.orders && data.orders.length > 0) {
        //             setOrders(data.orders);
        //             localStorage.setItem('orders', JSON.stringify(data.orders));
        //         }
        //         setAnalytics(data.analytics || {});
        //     })
        //     .catch(err => console.error("Lỗi lấy analytics:", err));
        // apiGet('admin/meals').then(setDishes).catch(() => setDishes([]));
    }, [setOrders]);

    useEffect(() => {
        if (orders) {
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

    const getOrderTotal = (order) => {
        return getOrderPayableTotal(order);
    };

    const totalRevenue = useMemo(() => {
        return confirmedOrders.reduce((sum, order) => sum + getOrderPayableTotal(order), 0);
    }, [confirmedOrders]);

    // Tính doanh thu từng tháng trong năm hiện tại
    const monthlyRevenue = analytics.monthlyRevenue || Array(12).fill(0);
    orders.forEach(order => {
        if (
            order.status === "Preparing Food" ||
            order.status === "Out for Delivery" ||
            order.status === "Delivered"
        ) {
            const date = new Date(order.orderDate);
            if (date.getFullYear() === new Date().getFullYear()) {
                const month = date.getMonth();
                monthlyRevenue[month] += getOrderTotal(order);
            }
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
    startOfWeek.setHours(0, 0, 0, 0);              // normalize to midnight
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as week start

    let revenueToday = 0;
    let revenueThisWeek = 0;
    let revenueThisYear = 0;

    orders.forEach(order => {
        if (
            order.status === "Preparing Food" ||
            order.status === "Out for Delivery" ||
            order.status === "Delivered"
        ) {
            const date = new Date(order.orderDate);
            const orderRevenue = getOrderTotal(order);

            if (date.toLocaleDateString() === todayStr) {
                revenueToday += orderRevenue;
            }
            if (date >= startOfWeek && date <= now) {
                revenueThisWeek += orderRevenue;
            }
            if (date.getFullYear() === now.getFullYear()) {
                revenueThisYear += orderRevenue;
            }
        }
    });

    const mixedData = {
        labels: monthLabels,
        datasets: [
            {
                type: 'line',
                label: 'Monthly Revenue (Line)',
                data: monthlyRevenue,
                borderColor: '#e67e22',
                backgroundColor: '#e67e22',
                fill: false,
                tension: 0.3,
                yAxisID: 'y',
            },

        ],
    };

    const mixedOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: value => '$' + value.toLocaleString(),
                },
            },
        },
    };

    const [orderPage, setOrderPage] = useState(1);
    const ORDERS_PER_PAGE = 10;
    const totalOrderPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

    const pagedOrders = [...orders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE);

    const [showRevenueAnalysis, setShowRevenueAnalysis] = useState(false);

    const categoryMap = {};
    orders.forEach(order => {
        if (
            order.status === "Preparing Food" ||
            order.status === "Out for Delivery" ||
            order.status === "Delivered"
        ) {
            const dish = dishes.find(d => d.title === order.name || d.title === order.itemName || d.title === order.dishName);
            const category = dish?.category || "Other";
            const revenue = parseFloat(order.price || 0) * (order.quantity || 1);
            if (!categoryMap[category]) {
                categoryMap[category] = { revenue: 0, count: 0 };
            }
            categoryMap[category].revenue += revenue;
            categoryMap[category].count += order.quantity || 1;
        }
    });
    const totalCategoryRevenue = Object.values(categoryMap).reduce((sum, cat) => sum + cat.revenue, 0);

    const categoryLabels = Object.keys(categoryMap);
    const categoryRevenues = categoryLabels.map(cat => categoryMap[cat].revenue);
    const categoryCounts = categoryLabels.map(cat => categoryMap[cat].count);

    const doughnutData = {
        labels: categoryLabels,
        datasets: [
            {
                data: categoryRevenues,
                backgroundColor: [
                    "#f9c74f", "#90be6d", "#43aa8b", "#577590", "#f94144", "#f3722c"
                ],
                borderWidth: 0,
            }
        ]
    };

    const doughnutOptions = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        cutout: "70%",
        responsive: true,
        maintainAspectRatio: false
    };

    // Giả sử chi phí mỗi món ăn là 70% giá bán (có thể thay đổi theo thực tế)
    const monthlyCost = monthlyRevenue.map(rev => rev * 0.7);
    const monthlyProfit = monthlyRevenue.map((rev, idx) => rev - monthlyCost[idx]);

    const profitLossData = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Profit',
                data: monthlyProfit,
                backgroundColor: '#36b0c2',
                borderRadius: 8,
            },
            {
                label: 'Loss',
                data: monthlyCost,
                backgroundColor: '#e67e22',
                borderRadius: 8,
            }
        ]
    };

    const profitLossOptions = {
        responsive: true,
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: value => '$' + value.toLocaleString(),
                },
            },
        },
    };

    return (
        <div className="container py-4" style={{ maxWidth: 1200 }}>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Dashboard</h2>
            </div>

            <div>

                <div className="mb-4">
                    <div className="row g-3">
                        <div className="col-lg-8">
                            <div className="p-4 rounded-3 bg-white border h-100">
                                <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Income this year</h5>
                                <div className="mt-3 w-100" style={{ height: 300, paddingLeft: 50, paddingTop: 0 }}>
                                    <Bar data={mixedData} options={mixedOptions} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 d-flex flex-column gap-3">
                            <div className="p-4 rounded-3 bg-white border flex-fill">
                                <span className="text-muted" style={{ fontSize: 20 }}>Daily</span>
                                <div className="fw-bold" style={{ fontSize: 35, color: '#36b0c2' }}>
                                    ${revenueToday.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="p-4 rounded-3 bg-white border flex-fill">
                                <span className="text-muted" style={{ fontSize: 20 }}>Weekly</span>
                                <div className="fw-bold" style={{ fontSize: 35, color: '#36b0c2' }}>
                                    ${revenueThisWeek.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="p-4 rounded-3 bg-white border flex-fill">
                                <span className="text-muted" style={{ fontSize: 20 }}>Yearly</span>
                                <div className="fw-bold" style={{ fontSize: 35, color: '#36b0c2' }}>
                                    ${revenueThisYear.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-lg-6 col-12">
                        {/* Sale by Category */}
                        <div className="p-4 border rounded-4 bg-white text-black h-100" style={{ minHeight: 340 }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-bold mb-0">Sales By Category</h4>
                                <div>
                                    <select className="form-select form-select-sm text-black border-0" style={{ width: 100 }}>
                                        <option>Month</option>
                                        <option>Year</option>
                                        <option>All</option>
                                    </select>
                                </div>
                            </div>
                            <div className="d-flex align-items-center" style={{ minHeight: 220 }}>
                                <div style={{ width: 180, height: 180, position: "relative" }}>
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                    <div style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        color: "#2c3e50",
                                        fontWeight: "bold",
                                        fontSize: 32,
                                        textAlign: "center"
                                    }}>
                                        ${totalCategoryRevenue.toLocaleString()}
                                    </div>
                                </div>
                                <div className="ms-4 flex-grow-1">
                                    {categoryLabels.map((cat, idx) => {
                                        const percent = ((categoryMap[cat].revenue / totalCategoryRevenue) * 100) || 0;
                                        return (
                                            <div key={cat} className="d-flex align-items-center mb-3">
                                                <span style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: "50%",
                                                    display: "inline-block",
                                                    background: doughnutData.datasets[0].backgroundColor[idx],
                                                    marginRight: 10
                                                }}></span>
                                                <div className="flex-grow-1">
                                                    <span className="fw-bold" style={{ color: "#2c3e50" }}>{cat}</span>
                                                    <span className="text-muted ms-2" style={{ fontSize: 13 }}>
                                                        ({percent.toFixed(2)}%)
                                                    </span>
                                                    <div className="text-muted" style={{ fontSize: 13 }}>
                                                        {categoryCounts[idx].toLocaleString()} CATEGORY PRODUCTS
                                                    </div>
                                                </div>
                                                <span className="fw-bold ms-3" style={{ color: "#2c3e50" }}>
                                                    ${categoryMap[cat].revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-12">
                        <div className="p-4 border rounded-4 bg-white text-black h-100" style={{ minHeight: 340 }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-bold mb-0">Profit & Loss By Month</h4>
                            </div>
                            <div style={{ height: 220 }}>
                                <Bar data={profitLossData} options={profitLossOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
