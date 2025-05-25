import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireStudent = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return <Navigate to="/login" />;
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.role && decoded.role.toLowerCase() === "student") {
            return children;
        }
    } catch (e) { }
    // Nếu không phải student thì về trang chủ
    return <Navigate to="/" />;
};

export default RequireStudent;
