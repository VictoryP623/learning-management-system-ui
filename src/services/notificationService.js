// src/services/notificationService.js
import axios from "axios";

const API_URL = "http://localhost:8081/api";

const authHeader = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// [CHANGED] nhận page,size và trả PageDto
export const listNotifications = async (page = 0, size = 20) => {
    const res = await axios.get(`${API_URL}/notifications`, {
        params: { page, size },
        headers: authHeader()
    });
    return res.data; // PageDto
};

export const unreadCount = async () => {
    const res = await axios.get(`${API_URL}/notifications/unread-count`, { headers: authHeader() });
    return res.data;
};

export const markRead = async (id) => {
    return axios.post(`${API_URL}/notifications/mark-read/${id}`, {}, { headers: authHeader() });
};

export const markAllRead = async () => {
    return axios.post(`${API_URL}/notifications/mark-all-read`, {}, { headers: authHeader() });
};

// Tuỳ chọn: tạo notif test từ FE
export const testSend = async (payload) => {
    const res = await axios.post(`${API_URL}/notifications/test-send`, payload, { headers: authHeader() });
    return res.data;
};
