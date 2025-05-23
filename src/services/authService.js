// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';  // Địa chỉ API của bạn

// Đăng nhập người dùng
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
        console.log('Login Response:', response.data);  // Kiểm tra thông tin trả về từ backend
        return response.data;  // Trả về dữ liệu từ API
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;  // Để bắt lỗi khi gọi API
    }
};

// Đăng ký người dùng mới
export const signUpUser = async (name, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
        return response.data;
    } catch (error) {
        console.error('Error signing up:', error);
    }
};

// Lấy thông tin người dùng từ JWT token
export const getUserProfile = async () => {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
};
