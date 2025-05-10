// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-dark text-white p-3">
            <div className="container">
                <h1>Learning Management System</h1>
                <nav>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/courses" className="nav-link">Courses</Link>
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/signup" className="nav-link">Sign Up</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
