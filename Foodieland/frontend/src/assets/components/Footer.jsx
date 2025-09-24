import React from 'react';
import { Link } from 'react-router-dom';
import FacebookIcon from '../images/HeaderVsFooter/facebook.svg';
import TwitterIcon from '../images/HeaderVsFooter/twitter.svg';
import InstagramIcon from '../images/HeaderVsFooter/instagram.svg';

export default function Footer() {
    return (
        <footer className="bg-white border-top shadow-sm">
            <div
                className="d-flex align-items-center justify-content-between flex-wrap"
                style={{
                    padding: '20px 10%',
                    maxWidth: '1400px',
                    margin: '0 auto',
                }}
            >
                <div>
                    <Link
                        to="/"
                        className="fw-bold"
                        style={{
                            fontSize: '24px',
                            color: '#2c3e50',
                            textDecoration: 'none',
                            fontFamily: 'Georgia, serif',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <span style={{ color: '#36b0c2' }}>Foodie</span>land
                    </Link>
                    <p style={{ fontSize: '0.9rem', maxWidth: '400px', color: '#6c757d', marginBottom: 0 }}>
                        Planning meals with love and balance.
                    </p>
                </div>

                <nav className="d-flex gap-4 mt-3 mt-md-0">
                    <Link
                        to="/contact"
                        className="text-decoration-none"
                        style={{
                            color: '#6c757d',
                            transition: 'color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#36b0c2'}
                        onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                    >
                        Contact
                    </Link>
                    <Link
                        to="/about"
                        className="text-decoration-none"
                        style={{
                            color: '#6c757d',
                            transition: 'color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#36b0c2'}
                        onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                    >
                        About Us
                    </Link>
                </nav>

                <div className="d-flex gap-3 mt-3 mt-md-0">
                    {[FacebookIcon, TwitterIcon, InstagramIcon].map((icon, idx) => (
                        <a key={idx} href="#" className="d-flex align-items-center justify-content-center"
                            style={{
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '50%',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d9f1f4'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        >
                            <img src={icon} alt="Social" style={{ height: '18px' }} />
                        </a>
                    ))}
                </div>
            </div>

            <div style={{
                borderBottom: '1px solid #e0e0e0',
                maxWidth: '1400px',
                margin: '0 auto'
            }}></div>

            <div
                className="d-flex justify-content-center align-items-center flex-wrap py-3 px-4"
                style={{ maxWidth: '1400px', margin: '0 auto' }}
            >

                <div className="text-center" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    © 2025 Foodieland. Powered by <span style={{ color: '#f77' }}>Webflow</span>
                </div>

            </div>
        </footer>
    );
}
