import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";

const headerStyle = {
    background: '#20232a',
    borderBottom: '2.5px solid #1677ff',
    boxShadow: '0 2px 12px 0 rgba(22,119,255,0.09)',
    padding: 0,
    position: 'sticky',
    top: 0,
    zIndex: 100
};
const containerStyle = {
    maxWidth: 1240,
    margin: '0 auto',
    padding: '16px 32px 10px 32px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
};
const titleStyle = {
    fontWeight: 900,
    fontSize: '2.0rem',
    letterSpacing: 0.7,
    color: '#1677ff',
    margin: 0,
    fontFamily: 'Montserrat, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: 10
};
const navContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: 6
};
const navLinkStyle = {
    background: '#1083fd',
    color: '#fff',
    padding: '7px 22px',
    borderRadius: 22,
    fontSize: '1.1rem',
    fontWeight: 500,
    border: 'none',
    textDecoration: 'none',
    margin: '0 4px',
    boxShadow: '0 2px 8px 0 rgba(20,55,135,0.07)',
    transition: 'background 0.18s, box-shadow 0.18s',
    display: 'inline-block',
    cursor: 'pointer'
};
const navLinkHover = {
    background: '#2365ea',
    boxShadow: '0 4px 16px 0 rgba(22,119,255,0.12)'
};
const btnLinkStyle = {
    ...navLinkStyle,
    background: '#23262a',
    color: '#fff',
    border: '1.3px solid #1677ff'
};

const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 22,
    background: '#23262a',
    borderRadius: 22,
    padding: '4px 18px 4px 8px',
    gap: 10,
    minWidth: 110
};

const Header = () => {
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [hoveredLink, setHoveredLink] = useState('');
    const navigate = useNavigate();

    // Lấy role và fullname user từ accessToken
    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
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
        window.addEventListener("cartChanged", reloadCart);
        return () => {
            window.removeEventListener("userChanged", reloadCart);
            window.removeEventListener("cartChanged", reloadCart);
        };
    }, [fetchCartCount]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUserRole(null);
        setUserName('');
        window.dispatchEvent(new Event("userChanged"));
        navigate('/login');
    };

    // Avatar
    const renderAvatar = () => {
        if (!userName) return <FaUserCircle size={30} color="#fff" />;
        // Chỉ lấy tối đa 2 ký tự đầu mỗi từ
        const words = userName.trim().split(' ');
        let initials = words.map(w => w[0]).join('').toUpperCase();
        initials = initials.slice(0, 2); // lấy tối đa 2 ký tự cho avatar
        return (
            <div style={{
                width: 34, height: 34,
                background: '#1677ff',
                color: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 17,
                marginRight: 7,
                userSelect: 'none',
                letterSpacing: 0.5,
            }}>{initials}</div>
        );
    };

    const renderUserInfo = () => {
        if (!userRole || !userName) return null;
        const roleStr = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        return (
            <div
                style={{ ...userInfoStyle, cursor: "pointer" }}
                onClick={() => navigate('/profile')}
                title="Xem trang cá nhân"
            >
                {renderAvatar()}
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.13 }}>
                    <span style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: '#ffc107',
                        letterSpacing: 0.1,
                        marginBottom: 3
                    }}>
                        {roleStr}
                    </span>
                    <span style={{
                        fontWeight: 500,
                        fontSize: 15,
                        color: '#FFFACD',
                        letterSpacing: 0.1,
                    }}>
                        {userName}
                    </span>
                </div>
            </div>
        );
    };

    // Menu cho từng role
    const menuData = !userRole ? [
        { to: "/courses", label: "Courses" },
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Sign Up", special: true }
    ] : userRole === 'admin' ? [
        { to: "/admin-dashboard", label: "Admin Dashboard" },
        { to: "/courses", label: "Courses" },
        // { to: "/profile", label: "Profile" },  // <-- XÓA
        { action: handleLogout, label: "Logout", special: true }
    ] : userRole === 'instructor' ? [
        { to: "/instructor-dashboard", label: "Instructor Dashboard" },
        { to: "/courses", label: "Courses" },
        { to: "/create-course", label: "Create Course" },
        // { to: "/profile", label: "Profile" },  // <-- XÓA
        { action: handleLogout, label: "Logout", special: true }
    ] : [
        { to: "/courses", label: "Courses" },
        { to: "/instructors", label: "Instructors" },
        { to: "/my-courses", label: "My Courses" },
        // { to: "/profile", label: "Profile" },  // <-- XÓA
        { action: handleLogout, label: "Logout", special: true }
    ];

    const renderMenu = () => (
        <div style={navContainer}>
            {menuData.map((item, idx) =>
                item.action ?
                    <button
                        key={item.label}
                        className="nav-link btn btn-link"
                        style={{ ...btnLinkStyle, ...(hoveredLink === item.label ? navLinkHover : {}) }}
                        onClick={item.action}
                        onMouseEnter={() => setHoveredLink(item.label)}
                        onMouseLeave={() => setHoveredLink('')}
                    >{item.label}</button>
                    :
                    <Link
                        key={item.label}
                        to={item.to}
                        className="nav-link"
                        style={{ ...navLinkStyle, ...(item.special ? btnLinkStyle : {}), ...(hoveredLink === item.label ? navLinkHover : {}) }}
                        onMouseEnter={() => setHoveredLink(item.label)}
                        onMouseLeave={() => setHoveredLink('')}
                    >
                        {item.label}
                    </Link>
            )}
        </div>
    );

    return (
        <header style={headerStyle}>
            <div style={containerStyle}>
                <Link to="/" style={{ ...titleStyle, textDecoration: 'none', display: 'flex', alignItems: 'center', marginRight: 22 }}>
                    <img src="/logo192.png" alt="Logo" style={{ width: 36, marginRight: 9, verticalAlign: 'middle' }} />
                    LMS
                </Link>
                {renderMenu()}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {userRole === 'student' &&
                        <span
                            style={{
                                marginLeft: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                                background: '#1677ff',
                                borderRadius: 22,
                                padding: '7px 15px 7px 11px',
                                transition: 'background 0.16s',
                                boxShadow: '0 1.5px 6px 0 rgba(22,119,255,0.09)'
                            }}
                            onClick={() => navigate('/saved-courses')}
                            title="Xem giỏ hàng"
                        >
                            <FaShoppingCart size={21} color="#fff" />
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -4,
                                    background: 'red',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    padding: '1.5px 7px',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    minWidth: 24,
                                    textAlign: 'center',
                                    border: '2.5px solid #20232a'
                                }}>{cartCount}</span>
                            )}
                        </span>
                    }
                    {renderUserInfo()}
                </div>
            </div>
        </header>
    );
};

export default Header;
