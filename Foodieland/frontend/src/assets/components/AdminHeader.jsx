import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../css/Header.css";

export default function Header() {
    const [dashboardOpen, setDashboardOpen] = useState(false);
    const dashboardRef = useRef(null);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [activeTab, setActiveTab] = useState('orders');
    const userName = localStorage.getItem("userName");
    const isLoggedIn = !!userName;
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.startsWith('/admin/analytics')) setActiveTab('analytics');
        else if (location.pathname.startsWith('/admin/orders')) setActiveTab('orders');
        else if (location.pathname.startsWith('/admin/dishes')) setActiveTab('dishes');
        else if (location.pathname.startsWith('/admin/vouchers')) setActiveTab('vouchers');
        else if (location.pathname.startsWith('/admin/messages') || location.pathname.startsWith('/admin/registered-users')) setActiveTab('messages');
        else setActiveTab('dashboard');
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dashboardOpen &&
                dashboardRef.current &&
                !dashboardRef.current.contains(event.target) &&
                !event.target.classList.contains('dashboard-toggle-btn')
            ) {
                setDashboardOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dashboardOpen]);

    const tabItems = [
        { key: 'dashboard', label: 'Dashboard', to: '/admin/dashboard', icon: 'bi-speedometer2' },
        { key: 'analytics', label: 'Analytics', to: '/admin/analytics', icon: 'bi-graph-up' },
        { key: 'orders', label: 'Orders', to: '/admin/orders', icon: 'bi-box2' },
        { key: 'dishes', label: 'Dishes', to: '/admin/dishes', icon: 'bi-egg-fried' },
        { key: 'vouchers', label: 'Voucher', to: '/admin/vouchers', icon: 'bi-ticket-perforated' },
        { key: 'Feedback', label: 'Feedback', to: '/admin/messages', icon: 'bi-people' }
    ];

    return (
        <header
            className="bg-white shadow-sm"
            style={{
                borderBottom: '1px solid #d8d8d8ff',
                height: '80px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}
        >
            <div
                className="d-flex align-items-center justify-content-between container"
                style={{ height: '100%' }}
            >
                <div className="d-flex align-items-center" style={{ flex: '0 0 auto' }}>
                    <Link
                        to="/admin/dashboard"
                        className="fw-bold"
                        style={{
                            fontSize: '24px',
                            color: '#2c3e50',
                            textDecoration: 'none',
                            fontFamily: 'Georgia, serif',
                            letterSpacing: '1px'
                        }}
                    >
                        <span style={{ color: '#36b0c2' }}>Foodie</span>land
                    </Link>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <nav>
                        <ul className="nav nav-tabs border-0" style={{ gap: '8px' }}>
                            {tabItems.map(tab => (
                                <li className="nav-item" key={tab.key}>
                                    <Link
                                        to={tab.to}
                                        className={`nav-link${activeTab === tab.key ? ' active' : ''}`}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            color: activeTab === tab.key ? '#36b0c2' : '#2c3e50',
                                            fontWeight: 500,
                                            fontSize: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            borderBottom: activeTab === tab.key ? '2px solid #36b0c2' : '2px solid transparent'
                                        }}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <i className={`bi ${tab.icon}`}></i>
                                        {tab.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div ref={dropdownRef} style={{ position: 'relative', cursor: 'pointer' }}>
                    <div
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        {isLoggedIn ? (
                            <>
                                <img
                                    src="/images/user-avatar.png"
                                    alt="User Avatar"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid #ddd'
                                    }}
                                />
                                <span style={{ fontWeight: '500', color: '#2c3e50' }}>
                                    {userName}
                                </span>
                            </>
                        ) : (
                            <>
                                <i className="fa fa-user" style={{ fontSize: '20px', color: '#2c3e50' }}></i>
                                <span style={{ fontWeight: '500', color: '#2c3e50' }}>Guest</span>
                            </>
                        )}
                    </div>

                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '45px',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            borderRadius: '6px',
                            zIndex: 1001,
                            minWidth: '140px'
                        }}>
                            <Link
                                to="/admin/profile"
                                onClick={() => setDropdownOpen(false)}
                                style={{
                                    padding: '8px 12px',
                                    display: 'block',
                                    color: '#2c3e50',
                                    textDecoration: 'none',
                                    backgroundColor: 'white',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                Profile
                            </Link>

                            {isLoggedIn && (
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        const preservedOrders = localStorage.getItem('nutriplanner-orders');
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('userName');
                                        localStorage.removeItem('role');
                                        if (preservedOrders) localStorage.setItem('nutriplanner-orders', preservedOrders);
                                        window.location.href = "/login";
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        border: 'none',
                                        backgroundColor: 'white',
                                        color: '#d9534f',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                    Exit
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {dashboardOpen && (
                <>
                    <div
                        ref={dashboardRef}
                        className={`dashboard-slide${dashboardOpen ? ' open' : ''}`}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fw-bold" style={{ fontSize: '1.5rem', color: '#36b0c2' }}>Dashboard</span>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setDashboardOpen(false)}
                                aria-label="Close dashboard"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <nav className="flex-grow-1">
                            <ul className="list-unstyled mb-0" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {tabItems.map((item) => (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            onClick={() => setDashboardOpen(false)}
                                            className="btn btn-outline-secondary2 rounded-2 px-4 py-3 flex-grow-1 w-100 text-start d-flex align-items-center"
                                            style={{ height: '48px', fontWeight: 500, fontSize: '1.1rem' }}
                                        >
                                            <i className={`bi ${item.icon}`} style={{ marginRight: 18, fontSize: '1.5rem' }}></i>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <Link
                            to="/admin"
                            className="btn btn-outline-dark rounded px-3 py-2 w-100 mt-3 d-flex align-items-center justify-content-center"
                            style={{ borderRadius: '12px', fontWeight: 500 }}
                            onClick={() => setDashboardOpen(false)}
                        >
                            <i className="bi bi-speedometer2" style={{ marginRight: 8 }}></i>
                            Admin Dashboard
                        </Link>
                        {!isLoggedIn ? (
                            <Link
                                to="/login"
                                className="btn btn-outline-primary rounded px-3 py-2 w-100 mt-3 d-flex align-items-center justify-content-center"
                                style={{ borderRadius: '12px', fontWeight: 500 }}
                                onClick={() => setDashboardOpen(false)}
                            >
                                <i className="bi bi-box-arrow-in-right" style={{ marginRight: 8 }}></i>
                                Login
                            </Link>
                        ) : (
                            <button
                                className="btn btn-outline-danger rounded px-3 py-2 w-100 mt-3 d-flex align-items-center justify-content-center"
                                style={{ borderRadius: '12px', fontWeight: 500 }}
                                onClick={() => {
                                    const preservedOrders = localStorage.getItem('nutriplanner-orders');
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('userName');
                                    localStorage.removeItem('role');
                                    if (preservedOrders) localStorage.setItem('nutriplanner-orders', preservedOrders);
                                    setDashboardOpen(false);
                                    window.location.href = "/login";
                                }}
                            >
                                <i className="bi bi-box-arrow-right" style={{ marginRight: 8 }}></i>
                                Logout
                            </button>
                        )}
                    </div>
                    <div
                        className="dashboard-backdrop"
                        onClick={() => setDashboardOpen(false)}
                    />
                </>
            )}
        </header>
    );
}
