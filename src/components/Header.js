import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const headerStyle = {
    background: '#23262a',
    borderBottom: '4px solid #1677ff',
    padding: 0,
};
const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '36px 0 18px 0',
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
    marginBottom: 20,
};
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
    const [userName, setUserName] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    // Lấy role và fullname user từ accessToken (KHÔNG dùng localStorage 'user')
    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                setUserRole(decoded.role?.toLowerCase());
                setUserName(decoded.fullname || '');
            } catch (err) {
                setUserRole(null);
                setUserName('');
            }
        } else {
            setUserRole(null);
            setUserName('');
        }
    };

    const fetchCartCount = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (userRole === 'student' && token) {
            try {
                const res = await fetch('http://localhost:8080/api/students/carts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setCartCount(data?.data?.totalElements || 0);
            } catch {
                setCartCount(0);
            }
        } else {
            setCartCount(0);
        }
    }, [userRole]);

    useEffect(() => {
        checkAuth();
        window.addEventListener("userChanged", checkAuth);
        return () => window.removeEventListener("userChanged", checkAuth);
    }, []);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    useEffect(() => {
        const reloadCart = () => fetchCartCount();
        window.addEventListener("userChanged", reloadCart);
        return () => window.removeEventListener("userChanged", reloadCart);
    }, [fetchCartCount]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUserRole(null);
        setUserName('');
        window.dispatchEvent(new Event("userChanged"));
        navigate('/login');
    };

    const renderUserInfo = () => {
        if (!userRole || !userName) return null;
        const roleStr = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 32,
                minWidth: 150,            
                lineHeight: 1.1
            }}>
                <span style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#fff',
                    marginBottom: 2,
                    letterSpacing: 0.2,
                }}>
                    {roleStr}
                </span>
                <span style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#ffc107',
                    letterSpacing: 0.2,
                    wordBreak: 'break-word',
                    textAlign: 'center',    // <-- ĐẢM BẢO CHỮ DÀI KHÔNG LỆCH
                }}>
                    {userName}
                </span>
            </div>
        );
    };    

    // Menu cho từng role
    const renderMenu = () => {
        if (!userRole) {
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
                <nav className="nav gap-3" style={{ alignItems: 'center' }}>
                    <Link to="/" className="nav-link fw-bold" style={{ fontSize: 18 }}>
                        Home
                    </Link>
                    {renderMenu()}
                    {userRole === 'student' &&
                        <span
                            style={{
                                marginLeft: 24,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative'
                            }}
                            onClick={() => navigate('/saved-courses')}
                            title="Xem giỏ hàng"
                        >
                            <FaShoppingCart size={24} color="#fff" />
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -10,
                                    background: 'red',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    padding: '2px 8px',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    minWidth: 24,
                                    textAlign: 'center'
                                }}>{cartCount}</span>
                            )}
                        </span>
                    }
                    {renderUserInfo()}
                </nav>
            </div>
        </header>
    );
};

export default Header;
