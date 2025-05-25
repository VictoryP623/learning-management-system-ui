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
    let url = `http://localhost:8080/api/categories?page=${page}&limit=${limit}`;
    if (categoryName) url += `&categoryName=${encodeURIComponent(categoryName)}`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Fetch categories failed');
    const result = await res.json();
    // API trả về { code, message, data }, data là PageDto
    return result.data;
};

// ADD category
export const addCategory = async (data) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://localhost:8080/api/categories', {
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
    const res = await fetch(`http://localhost:8080/api/categories/${id}`, {
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
    const res = await fetch(`http://localhost:8080/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Delete category failed');
    }
    return (await res.json()).data;
};