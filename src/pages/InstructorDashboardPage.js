// src/pages/InstructorDashboardPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstructorCourses } from '../services/api';  // Lấy thông tin khóa học của giảng viên

const InstructorDashboardPage = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Lấy danh sách khóa học của giảng viên khi trang tải
        const fetchInstructorCourses = async () => {
            const data = await getInstructorCourses();  // Gọi API lấy các khóa học của giảng viên
            setCourses(data);  // Lưu dữ liệu vào state
        };

        fetchInstructorCourses();
    }, []);

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Instructor Dashboard</h2>

            <Link to="/instructor/add-course" className="btn btn-success mb-4">Add New Course</Link>

            <h4 className="mb-4">Your Courses</h4>

            <div className="row">
                {courses.length === 0 ? (
                    <div className="col-12">
                        <p>No courses found.</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <div className="col-md-4 mb-4" key={course.id}>
                            <div className="card">
                                <img src={course.image} className="card-img-top" alt={course.name} />
                                <div className="card-body">
                                    <h5 className="card-title">{course.name}</h5>
                                    <p className="card-text">{course.description}</p>
                                    <Link to={`/course/${course.id}`} className="btn btn-primary">View Course</Link>
                                    <Link to={`/instructor/edit-course/${course.id}`} className="btn btn-warning ml-2">Edit</Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InstructorDashboardPage;
