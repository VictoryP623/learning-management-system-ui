import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Thêm CSS inline cho nhanh (có thể tách file CSS riêng nếu muốn)
const headerStyle = {
    background: '#23262a',
    borderBottom: '4px solid #1677ff',
    padding: 0,
};

const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '36px 0 18px 0', // TOP nhiều lên cho title cân giữa, bottom để không dính menu
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const titleStyle = {
    fontWeight: 700,
    fontSize: '1.7rem',
    letterSpacing: 0.5,
    color: '#fff',
    margin: 0,
    marginBottom: 20, // Cách menu bên dưới
};

// const navStyle = {
//     display: 'flex',
//     gap: 32,
//     alignItems: 'center',
//     marginTop: 0,
// };

const navLinkStyle = {
    background: '#1083fd',
    color: '#fff',
    padding: '6px 24px',
    borderRadius: 16,
    fontSize: '1.08rem',
    fontWeight: 500,
    border: 'none',
    textDecoration: 'none',
    boxShadow: '0 2px 6px 0 rgba(20,55,135,0.10)',
    transition: 'background 0.18s',
    display: 'inline-block'
};
const btnLinkStyle = {
    ...navLinkStyle,
    background: '#1677ff',
    cursor: 'pointer'
};

const Header = () => {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    // Nhận role như cũ
    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                setUserRole(decoded.role?.toLowerCase());
            } catch (err) {
                setUserRole(null);
            }
        } else {
            setUserRole(null);
        }
    };

    useEffect(() => {
        checkAuth();
        window.addEventListener("userChanged", checkAuth);
        return () => window.removeEventListener("userChanged", checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUserRole(null);
        window.dispatchEvent(new Event("userChanged"));
        navigate('/login');
    };

    // Menu cho từng role
    const renderMenu = () => {
        if (!userRole) {
            // Chưa login: Courses và Instructors luôn hiện
            return (
                <>
                    <Link to="/courses" className="nav-link" style={navLinkStyle}>Courses</Link>
                    <Link to="/instructors" className="nav-link" style={navLinkStyle}>Instructors</Link>
                    <Link to="/login" className="nav-link" style={navLinkStyle}>Login</Link>
                    <Link to="/signup" className="nav-link" style={navLinkStyle}>Sign Up</Link>
                </>
            );
        }
        if (userRole === 'admin') {
            return (
                <>
                    <Link to="/admin-dashboard" className="nav-link" style={navLinkStyle}>Admin Dashboard</Link>
                    <Link to="/courses" className="nav-link" style={navLinkStyle}>Courses</Link>
                    <Link to="/profile" className="nav-link" style={navLinkStyle}>Profile</Link>
                    <button onClick={handleLogout} className="nav-link btn btn-link" style={btnLinkStyle}>Logout</button>
                </>
            );
        }
        if (userRole === 'instructor') {
            return (
                <>
                    <Link to="/instructor-dashboard" className="nav-link" style={navLinkStyle}>Instructor Dashboard</Link>
                    <Link to="/courses" className="nav-link" style={navLinkStyle}>Courses</Link>
                    <Link to="/create-course" className="nav-link" style={navLinkStyle}>Create Course</Link>
                    <Link to="/profile" className="nav-link" style={navLinkStyle}>Profile</Link>
                    <button onClick={handleLogout} className="nav-link btn btn-link" style={btnLinkStyle}>Logout</button>
                </>
            );
        }
        // Student
        return (
            <>
                <Link to="/courses" className="nav-link" style={navLinkStyle}>Courses</Link>
                <Link to="/instructors" className="nav-link" style={navLinkStyle}>Instructors</Link>
                <Link to="/my-courses" className="nav-link" style={navLinkStyle}>My Courses</Link>
                <Link to="/profile" className="nav-link" style={navLinkStyle}>Profile</Link>
                <button onClick={handleLogout} className="nav-link btn btn-link" style={btnLinkStyle}>Logout</button>
            </>
        );
    };

    return (
        <header style={headerStyle}>
            <div style={containerStyle}>
                <h4 style={titleStyle}>Learning Management System</h4>
                <nav className="nav gap-3">
                    <Link to="/" className="nav-link fw-bold" style={{ fontSize: 18 }}>
                        Home
                    </Link>
                    {renderMenu()}
                </nav>

            </div>
        </header>
    );
};

export default Header;
