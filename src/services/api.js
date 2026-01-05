// src/services/api.js
import axios from 'axios';

// Địa chỉ backend của bạn
const RAW_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const API_URL = RAW_BASE ? `${RAW_BASE}/api` : "http://localhost:8081/api";

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
    return await axios.get(`${API_URL}/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteCourse = async (id, token) => {
    return await axios.delete(`${API_URL}/courses/${id}`, {
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
    return axios.get(`${API_URL}/courses`, {
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
    return axios.post(`${API_URL}/courses`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getStudentPurchasedCourses = async (token) => {
    return axios.get(`${API_URL}/purchases/courses`, {
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
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        let err = {};
        try {
            err = await res.json();
        } catch { }
        throw err; // trả về object lỗi (bao gồm error từng field)
    }
    return await res.json();
};

// Thêm vào cuối file api.js
export const forgotPassword = async (email) => {
    try {
        const response = await fetch(
            `${API_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`,
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
    const res = await fetch(`${API_URL}/auth/update-password`, {
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
    const url = `${API_URL}/instructors?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!res.ok) throw new Error('Failed to fetch instructors');
    return await res.json();
}

export async function getInstructorDetail(instructorId, token) {
    const res = await fetch(`${API_URL}/instructors/${instructorId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    if (!res.ok) throw new Error('Failed to fetch instructor detail');
    return await res.json();
}

export async function getCoursesbyInstructor(instructorId, token) {
    const url = `${API_URL}/instructors/${instructorId}/courses`;
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
    const res = await fetch(`${API_URL}/purchases/paypal`, {
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
    axios.get(`${API_URL}/quizzes?lessonId=${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });

export const submitQuizAttempt = (data, token) =>
    axios.post(`${API_URL}/quizAttempts`, data, { headers: { Authorization: `Bearer ${token}` } });

export const getLessonDetail = (lessonId, token) =>
    axios.get(`${API_URL}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const markLessonCompleted = (lessonId, token) =>
    axios.post(`${API_URL}/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getLessonsByCourse = (courseId, token, name = "") =>
    axios.get(`${API_URL}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { courseId, name },
    });

export const uploadLessonVideo = (lessonId, file, durationSec, token) => {
    const form = new FormData();
    // Bạn đang dùng backend @RequestParam("file") ở LessonVideoController
    // => phải là "file", không phải "video"
    form.append("file", file);
    if (durationSec != null) form.append("durationSec", String(durationSec));

    return axios.post(`${API_URL}/lessons/${lessonId}/video`, form, {
        headers: {
            Authorization: `Bearer ${token}`,
            // QUAN TRỌNG: đừng set Content-Type thủ công
            // axios sẽ tự set boundary đúng
        },
        timeout: 0,
    });
};

export const getLessonResources = (lessonId, page = 0, limit = 100, token) => {
    return axios.get(`${API_URL}/lesson-resources`, {
        params: { lessonId, page, limit },
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const deleteLessonResource = (resourceId, token) => {
    return axios.delete(`${API_URL}/lesson-resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    // PDF
    "application/pdf",
    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // (Optional) some browsers / uploads may fallback
    "application/octet-stream",
];
// fallback theo đuôi nếu browser không set đúng MIME
function extOf(name = "") {
    const lower = String(name || "").toLowerCase();
    const i = lower.lastIndexOf(".");
    return i >= 0 ? lower.slice(i) : "";
}

export function validateFileType(file) {
    if (!file) return { valid: true, error: "" };
    const mime = file.type || "";
    const ext = extOf(file.name);

    const okByExt = [
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
    ].includes(ext);

    const ok = allowedTypes.includes(mime) || okByExt;

    if (!ok) {
        return {
            valid: false,
            error: "Định dạng file không hợp lệ! Chỉ cho phép ảnh, PDF, Word, Excel, PowerPoint.",
        };
    }
    return { valid: true, error: "" };
}

export const getMyReviewByCourse = async (courseId, token) =>
    axios.get(`${API_URL}/students/reviews/me/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const getMyReviewByCourseSafe = async (courseId, token) => {
    try {
        const res = await axios.get(`${API_URL}/students/reviews/me/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.data ?? res.data ?? null;
    } catch (err) {
        const status = err?.response?.status;
        if (status === 404) return null;        // chưa review => null
        throw err;                               // lỗi khác mới throw
    }
};


export const submitReview = async (data, token) =>
    axios.post(`${API_URL}/students/reviews`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const updateReview = async (data, token) =>
    axios.patch(`${API_URL}/students/reviews`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const deleteReview = async (courseId, token) =>
    axios.delete(`${API_URL}/students/reviews/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

// ================== ASSIGNMENTS ==================

// Lấy danh sách assignment theo lesson (Instructor & Student cùng dùng)
export const getAssignmentsByLesson = (lessonId, token) =>
    axios.get(`${API_URL}/assignments/by-lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

// Lấy chi tiết một assignment
export const getAssignmentDetail = (assignmentId, token) =>
    axios.get(`${API_URL}/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

// Student nộp / nộp lại bài
export const submitAssignment = (data, token) =>
    axios.post(`${API_URL}/assignments/submit`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });

// Student xem bài nộp của chính mình cho một assignment
export const getMyAssignmentSubmission = (assignmentId, token) =>
    axios.get(`${API_URL}/assignments/${assignmentId}/my-submission`, {
        headers: { Authorization: `Bearer ${token}` }
    });

// Instructor lấy danh sách bài nộp cho một assignment
export const getAssignmentSubmissions = (assignmentId, token) =>
    axios.get(`${API_URL}/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
    });

// Instructor chấm điểm một bài nộp
export const gradeAssignmentSubmission = (data, token) =>
    axios.post(`${API_URL}/assignments/grade`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });

// (Nếu sau này muốn Instructor tạo/sửa/xóa assignment từ FE thì có thể dùng 3 hàm này)
export const createAssignment = (data, token) =>
    axios.post(`${API_URL}/assignments`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const updateAssignment = (assignmentId, data, token) =>
    axios.patch(`${API_URL}/assignments/${assignmentId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const deleteAssignment = (assignmentId, token) =>
    axios.delete(`${API_URL}/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getCourseStudentsProgress = (courseId, token) =>
    axios.get(`${API_URL}/instructor/courses/${courseId}/students-progress`, {
        headers: { Authorization: `Bearer ${token}` }
    });

export const getAssignmentsByCourse = async (courseId, token) => {
    // lessons
    const lessonsRes = await axios.get(`${API_URL}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { courseId }
    });
    const lessons = lessonsRes.data?.data || lessonsRes.data || [];
    const safeLessons = Array.isArray(lessons) ? lessons : [];

    // assignments by each lesson
    const all = [];
    for (const lesson of safeLessons) {
        const lessonId = lesson.id;
        if (!lessonId) continue;

        try {
            const asgRes = await axios.get(`${API_URL}/assignments/by-lesson/${lessonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const assignments = asgRes.data?.data || asgRes.data || [];
            const safeAssignments = Array.isArray(assignments) ? assignments : [];

            for (const a of safeAssignments) {
                all.push({
                    ...a,
                    lessonId,
                    lessonName: lesson.name || lesson.title || `Lesson ${lessonId}`,
                });
            }
        } catch (e) {
            // nếu lesson nào lỗi thì bỏ qua để page vẫn chạy
            console.error(`Error fetching assignments for lesson ${lessonId}:`, e);
        }
    }
    return all;
};

// Student: lấy my-submission "safe" (404 => coi như chưa nộp)
export const getMyAssignmentSubmissionSafe = async (assignmentId, token) => {
    try {
        const res = await axios.get(`${API_URL}/assignments/${assignmentId}/my-submission`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data?.data || res.data || null;
    } catch (err) {
        // tuỳ BE: có thể 404 hoặc 400 khi chưa nộp
        const status = err?.response?.status;
        if (status === 404 || status === 400) return null;
        throw err;
    }
};

export const getStudentAssignmentTimeline = (courseId, token) =>
    axios.get(`${API_URL}/student/courses/${courseId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
    });