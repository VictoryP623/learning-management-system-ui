// src/services/userService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';  // Địa chỉ backend của bạn

// Đăng ký người dùng
export const signUpUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password
        });
        return response.data;  // Trả về token hoặc thông tin người dùng
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};

// Đăng nhập người dùng
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        return response.data;  // Trả về token hoặc thông tin người dùng
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

// Lấy thông tin người dùng
export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;  // Trả về thông tin người dùng
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userData) => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.put(`${API_URL}/user/profile`, userData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;  // Trả về thông tin người dùng đã cập nhật
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};
