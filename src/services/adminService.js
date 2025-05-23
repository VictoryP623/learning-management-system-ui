// src/services/adminService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';  // Địa chỉ backend của bạn

// Lấy danh sách người dùng
export const getAllUsers = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await axios.get(`${API_URL}/users?page=0&size=99`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data?.data?.data || [];
};

// Lấy danh sách khóa học
export const getAllCourses = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await axios.get(`${API_URL}/courses?page=0&limit=99`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // Log ra để kiểm tra
    console.log("API getAllCourses res.data:", res.data);
    return res.data.data || [];
};

// Gọi để đổi trạng thái user
export const updateUserStatus = async (userId, status) => {
    const token = localStorage.getItem('accessToken');
    return await axios.patch(`${API_URL}/admin/users/${userId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Gọi để đổi trạng thái khóa học
export const updateCourseStatus = async (courseId, status) => {
    const token = localStorage.getItem('accessToken');
    await axios.patch(`${API_URL}/courses/${courseId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
