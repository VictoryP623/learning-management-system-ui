// src/pages/CourseDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';  // Để lấy id khóa học từ URL
import { getCourseDetail } from '../services/api';  // Lấy thông tin khóa học từ API

const CourseDetailPage = () => {
    const { id } = useParams();  // Lấy id khóa học từ URL
    const [course, setCourse] = useState(null);

    useEffect(() => {
        // Lấy chi tiết khóa học khi trang tải
        const fetchCourseDetail = async () => {
            const data = await getCourseDetail(id);  // Lấy chi tiết khóa học theo id
            setCourse(data);  // Lưu dữ liệu khóa học vào state
        };

        fetchCourseDetail();
    }, [id]);  // Chỉ gọi lại khi id thay đổi

    if (!course) {
        return <div>Loading...</div>;  // Hiển thị thông báo nếu chưa có dữ liệu
    }

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">{course.name}</h2>
            <div className="row">
                <div className="col-md-8">
                    <img src={course.image} alt={course.name} className="img-fluid" />
                    <h4 className="mt-4">Course Description</h4>
                    <p>{course.description}</p>

                    <h4 className="mt-4">Instructor: {course.instructor.name}</h4>
                    <p>{course.instructor.bio}</p>

                    <h4 className="mt-4">Lessons</h4>
                    <ul>
                        {course.lessons.map((lesson) => (
                            <li key={lesson.id}>{lesson.title}</li>
                        ))}
                    </ul>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Enroll in this Course</h5>
                            <p className="card-text">{course.price}</p>
                            <button className="btn btn-primary">Enroll Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
