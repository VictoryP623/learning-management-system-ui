// src/services/courseService.js
import { getCourses, getCourseDetail } from './api';  // Import từ api.js

// Hàm lấy tất cả khóa học
export const fetchCourses = async () => {
    const courses = await getCourses();
    return courses;
};

// Hàm lấy chi tiết một khóa học
export const fetchCourseDetail = async (courseId) => {
    const course = await getCourseDetail(courseId);
    return course;
};
