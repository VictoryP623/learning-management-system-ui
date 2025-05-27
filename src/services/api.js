// src/services/api.js
import axios from 'axios';

// Địa chỉ backend của bạn
const API_URL = 'http://localhost:8080/api';

// Hàm gọi API để lấy danh sách khóa học
export const getCourses = async ({ page = 0, limit = 99 } = {}) => {
    const token = localStorage.getItem('accessToken');
    // Chỉ set headers nếu có token
    const config = {
        params: { page, limit }
    };
    if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
    }

    try {
        const response = await axios.get(`${API_URL}/courses`, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
};


// Hàm lấy chi tiết khóa học
export const getCourseDetail = async (id, token) => {
    return await axios.get(`http://localhost:8080/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteCourse = async (id, token) => {
    return await axios.delete(`http://localhost:8080/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getInstructorIdByUserId = async (token, userId) => {
    const response = await axios.get(`${API_URL}/instructors/by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Hàm lấy danh sách các khóa học của giảng viên
export const getInstructorCourses = async (token, instructorId, page = 0, limit = 99) => {
    return axios.get(`http://localhost:8080/api/courses`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            page,
            limit,
            instructorId
        }
    });
};

export const createCourse = async (data, token) => {
    return axios.post('http://localhost:8080/api/courses', data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getStudentPurchasedCourses = async (token) => {
    return axios.get('http://localhost:8080/api/purchases/courses', {
        headers: { Authorization: `Bearer ${token}` },
    });
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
// export const signUpUser = async (email, password) => {
//     try {
//         const response = await axios.post(`${API_URL}/auth/signup`, {
//             email,
//             password
//         });  // Gửi POST request tới endpoint signup
//         return response.data;  // Trả về dữ liệu trả về từ API, bao gồm token
//     } catch (error) {
//         console.error('Error signing up:', error);
//         throw error;  // Ném lỗi nếu có
//     }
// };

// Hàm lấy thông tin người dùng
export const getUserProfile = async () => {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await axios.get(`${API_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Hàm cập nhật thông tin người dùng
export const updateUserProfile = async (userId, data) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
    }
    return await res.json();
};

// Thêm vào cuối file api.js
export const forgotPassword = async (email) => {
    try {
        const response = await fetch(
            `http://localhost:8080/api/auth/forgot-password?email=${encodeURIComponent(email)}`,
            { method: "POST" }
        );
        // Có thể return response.json() nếu BE trả message
        return response;
    } catch (error) {
        throw error;
    }
};
export const uploadLessonResource = async ({ lessonId, file, resourceName }) => {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('multipartFile', file);
    formData.append('lessonId', lessonId);
    if (resourceName) formData.append('resourceName', resourceName);

    return await axios.post(`${API_URL}/lesson-resources`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        }
    });
};

export async function updateUserPassword(data) {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://localhost:8080/api/auth/update-password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error updating password');
    }
    return await res.json();
}

// src/services/api.js
export async function getAllInstructors({ name = '', page = 0, limit = 10 }, token) {
    const url = `http://localhost:8080/api/instructors?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!res.ok) throw new Error('Failed to fetch instructors');
    return await res.json();
}

export async function getInstructorDetail(instructorId, token) {
    const res = await fetch(`http://localhost:8080/api/instructors/${instructorId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!res.ok) throw new Error('Failed to fetch instructor detail');
    return await res.json();
}

export async function getCoursesbyInstructor(instructorId, token) {
    const url = `http://localhost:8080/api/instructors/${instructorId}/courses`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!res.ok) throw new Error('Failed to fetch instructor courses');
    return await res.json();
}

export const createPaypalPurchase = async (courseIds) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://localhost:8080/api/purchases/paypal', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseIds)
    });
    return await res.json();
};


export const getLessonQuiz = (lessonId, token) =>
    axios.get(`http://localhost:8080/api/quizzes?lessonId=${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });

export const submitQuizAttempt = (data, token) =>
    axios.post('http://localhost:8080/api/quizAttempts', data, { headers: { Authorization: `Bearer ${token}` } });

export const getLessonDetail = (lessonId, token) =>
    axios.get(`http://localhost:8080/api/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const markLessonCompleted = (lessonId, token) =>
    axios.post(`http://localhost:8080/api/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

export function validateFileType(file) {
    if (!file) return { valid: true, error: "" };
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: "Định dạng file không hợp lệ! Chỉ cho phép ảnh, PDF, Word, Excel." };
    }
    return { valid: true, error: "" };
}

export const getMyReviewByCourse = async (courseId, token) =>
    axios.get(`http://localhost:8080/api/students/reviews/me/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const submitReview = async (data, token) =>
    axios.post('http://localhost:8080/api/students/reviews', data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const updateReview = async (data, token) =>
    axios.patch('http://localhost:8080/api/students/reviews', data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const deleteReview = async (courseId, token) =>
    axios.delete(`http://localhost:8080/api/students/reviews/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
