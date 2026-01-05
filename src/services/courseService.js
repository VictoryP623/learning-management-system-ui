// src/services/courseService.js
import axios from 'axios';

const RAW_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const API_URL = RAW_BASE ? `${RAW_BASE}/api` : "http://localhost:8081/api";  // Địa chỉ backend của bạn

// Lấy danh sách khóa học
export const getCourses = async () => {
    try {
        const response = await axios.get(`${API_URL}/courses`);
        return response.data;  // Trả về danh sách khóa học
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

// Lấy chi tiết khóa học theo ID
export const getCourseDetail = async (courseId) => {
    try {
        const response = await axios.get(`${API_URL}/courses/${courseId}`);
        return response.data;  // Trả về chi tiết khóa học
    } catch (error) {
        console.error('Error fetching course details:', error);
        throw error;
    }
};
