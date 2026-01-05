// src/services/adminService.js
import axios from 'axios';

const RAW_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const API_URL = RAW_BASE ? `${RAW_BASE}/api` : "http://localhost:8081/api";

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
export const updateCourseStatus = async (courseId, status, rejectedReason = null) => {
    const token = localStorage.getItem('accessToken');
    return await axios.patch(`${API_URL}/courses/${courseId}/status`,
        { status, rejectedReason },
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

// GET categories
export const getAllCategories = async (page = 0, limit = 10, categoryName = '') => {
    const token = localStorage.getItem('accessToken');
    let url = `${API_URL}/categories?page=${page}&limit=${limit}`;
    if (categoryName) url += `&categoryName=${encodeURIComponent(categoryName)}`;

    // Tạo object options, chỉ set headers khi có token
    let options = {};
    if (token) {
        options.headers = { Authorization: `Bearer ${token}` };
    }

    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Fetch categories failed');
    const result = await res.json();
    return result.data;
};

// ADD category
export const addCategory = async (data) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Add category failed');
    }
    return (await res.json()).data;
};

// UPDATE category
export const updateCategory = async (id, data) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Update category failed');
    }
    return (await res.json()).data;
};

// DELETE category
export const deleteCategory = async (id) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Delete category failed');
    }
    return (await res.json()).data;
};