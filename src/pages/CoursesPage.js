// src/pages/CoursesPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/api'; // Lấy API từ services

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Lấy danh sách khóa học khi trang tải
        const fetchCourses = async () => {
            const data = await getCourses();
            setCourses(data); // Lưu dữ liệu khóa học vào state
        };

        fetchCourses();
    }, []);

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Courses</h2>
            <div className="row">
                {courses.length === 0 ? (
                    <div className="col-12">
                        <p>Loading courses...</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <div className="col-md-3 mb-4" key={course.id}>
                            <div className="card">
                                <img src={course.image} className="card-img-top" alt={course.name} />
                                <div className="card-body">
                                    <h5 className="card-title">{course.name}</h5>
                                    <p className="card-text">{course.description}</p>
                                    <Link to={`/course/${course.id}`} className="btn btn-primary">Learn More</Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
