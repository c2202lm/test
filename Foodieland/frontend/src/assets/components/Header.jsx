import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [dashboardOpen, setDashboardOpen] = useState(false);
    const dashboardRef = useRef(null);

    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("role");
    const isLoggedIn = !!userName;
    const isAdmin = isLoggedIn && userRole === "admin";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
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

    return (
        <header
            className="bg-white shadow-sm"
            style={{
                borderBottom: '1px solid #e0e0e0',
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
                <div className="d-flex align-items-center">
                    <Link
                        to="/"
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

                <nav className="d-flex gap-4">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/categories', label: 'Categories' },
                        { to: '/favourite', label: 'Favourite' },
                        { to: '/contact', label: 'Contact' },
                        { to: '/about', label: 'About us' }
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.to}
                            className="nav-link"
                            style={{
                                color: '#2c3e50',
                                textDecoration: 'none',
                                fontWeight: '500',
                                position: 'relative',
                                transition: 'color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#36b0c2'}
                            onMouseLeave={(e) => e.target.style.color = '#2c3e50'}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <div
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
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
                            top: '40px',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            borderRadius: '6px',
                            zIndex: 1001,
                            minWidth: '120px'
                        }}>

                            {isLoggedIn && (
                                <Link
                                    to="/profile"
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
                            )}

                            <Link
                                to="/cart"
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
                                Cart
                            </Link>

                            <Link
                                to="/orders"
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
                                Orders
                            </Link>

                            {!isLoggedIn && (
                                <Link
                                    to="/login"
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
                                    Login
                                </Link>
                            )}

                            {isAdmin && (
                                <Link
                                    to="/admin"
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
                                    Dashboard
                                </Link>
                            )}

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
                                        color: 'red',
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

                {dashboardOpen && (
                    <>
                        <div
                            ref={dashboardRef}
                            className={`dashboard-slide ${dashboardOpen ? 'open' : ''}`}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                height: '100vh',
                                width: '420px',
                                background: '#fff',
                                boxShadow: '2px 0 16px rgba(0,0,0,0.12)',
                                zIndex: 2000,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '32px 24px 24px 24px'
                            }}
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
                                    {[
                                        { to: '/', label: 'Home', icon: 'bi-house' },
                                        { to: '/categories', label: 'Categories', icon: 'bi-grid' },
                                        { to: '/favourite', label: 'Favourite', icon: 'bi-heart' },
                                        { to: '/contact', label: 'Contact', icon: 'bi-envelope' },
                                        { to: '/about', label: 'About us', icon: 'bi-info-circle' }
                                    ].map((item, idx) => (
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
                                        setDropdownOpen(false);
                                        window.location.href = "/login";
                                    }}
                                >
                                    <i className="bi bi-box-arrow-right" style={{ marginRight: 8 }}></i>
                                    Logout
                                </button>
                            )}
                        </div>
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                background: 'rgba(0,0,0,0.2)',
                                zIndex: 1500
                            }}
                        />
                    </>
                )}
            </div>
        </header>
    );
}
