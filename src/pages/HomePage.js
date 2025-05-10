// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/api'; // Import dịch vụ API

const HomePage = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Lấy danh sách khóa học khi trang tải
        const fetchCourses = async () => {
            const data = await getCourses();
            setCourses(data);
        };

        fetchCourses();
    }, []);

    return (
        <div>


            <section className="features py-5">
                <div className="container text-center">
                    <h2 className="mb-4">Features</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="feature-box">
                                <h3>Expert Instructors</h3>
                                <p>Learn from the best in the industry!</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-box">
                                <h3>Interactive Learning</h3>
                                <p>Engage with courses through interactive modules.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-box">
                                <h3>Flexible Schedule</h3>
                                <p>Study at your own pace and convenience.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="featured-courses py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-4">Featured Courses</h2>
                    <div className="row">
                        {courses.slice(0, 4).map((course) => (
                            <div className="col-md-3" key={course.id}>
                                <div className="card">
                                    <img src={course.image} className="card-img-top" alt={course.name} />
                                    <div className="card-body">
                                        <h5 className="card-title">{course.name}</h5>
                                        <p className="card-text">{course.description}</p>
                                        <Link to={`/course/${course.id}`} className="btn btn-primary">Learn More</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
