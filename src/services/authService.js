// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';  // Địa chỉ API của bạn

// Đăng nhập người dùng
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        // Lưu token vào localStorage
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
    }
};

// Đăng ký người dùng mới
export const signup = async (name, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
        return response.data;
    } catch (error) {
        console.error('Error signing up:', error);
    }
};

// Lấy thông tin người dùng từ JWT token
export const getUserProfile = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};
