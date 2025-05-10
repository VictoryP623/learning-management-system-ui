// src/services/api.js
import axios from 'axios';

// Địa chỉ backend của bạn
const API_URL = 'http://localhost:8080/api';

// Hàm gọi API để lấy danh sách khóa học
export const getCourses = async () => {
    try {
        const response = await axios.get(`${API_URL}/courses`); // Gửi GET request tới /courses
        return response.data;  // Trả về dữ liệu khóa học
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];  // Nếu có lỗi, trả về một mảng rỗng
    }
};

// Hàm lấy chi tiết khóa học
export const getCourseDetail = async (courseId) => {
    try {
        const response = await axios.get(`${API_URL}/courses/${courseId}`); // Lấy chi tiết khóa học theo ID
        return response.data;
    } catch (error) {
        console.error('Error fetching course details:', error);
    }
};

// Hàm lấy danh sách các khóa học của giảng viên
export const getInstructorCourses = async () => {
    try {
        const response = await axios.get(`${API_URL}/instructor/courses`);  // Endpoint lấy khóa học của giảng viên
        return response.data;
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        return [];
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });  // Gửi POST request tới endpoint login
        return response.data;  // Trả về dữ liệu trả về từ API, bao gồm token
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;  // Ném lỗi nếu có
    }
};

// Hàm đăng ký người dùng
export const signUpUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password
        });  // Gửi POST request tới endpoint signup
        return response.data;  // Trả về dữ liệu trả về từ API, bao gồm token
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;  // Ném lỗi nếu có
    }
};

// Hàm lấy thông tin người dùng
export const getUserProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });  // Gửi GET request tới /user/profile
        return response.data;  // Trả về thông tin người dùng
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;  // Ném lỗi nếu có
    }
};

// Hàm cập nhật thông tin người dùng
export const updateUserProfile = async (user) => {
    try {
        const response = await axios.put(`${API_URL}/user/profile`, user, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });  // Gửi PUT request tới /user/profile để cập nhật thông tin
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;  // Ném lỗi nếu có
    }
};