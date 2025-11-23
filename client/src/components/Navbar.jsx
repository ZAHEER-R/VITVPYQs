import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">Z-VITPYQ</Link>
                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    {token ? (
                        <>
                            <Link to="/upload" className="nav-link">Upload</Link>
                            <Link to="/profile" className="nav-link">Profile</Link>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
