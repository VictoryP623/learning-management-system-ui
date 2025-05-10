// src/routes.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';  // Import Routes và Route
import HomePage from './pages/HomePage';  // Đảm bảo các pages được import đúng
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';

const RoutesConfig = () => {
    return (
        <Routes>  {/* Chắc chắn rằng bạn đang sử dụng Routes thay vì Switch */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
        </Routes>
    );
};

export default RoutesConfig;
