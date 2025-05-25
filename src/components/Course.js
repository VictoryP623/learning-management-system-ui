// src/components/Course.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Course = ({ courses, emptyText = "Chưa có khóa học nào." }) => {
    const navigate = useNavigate();

    if (!courses || courses.length === 0) {
        return <div className="text-center">{emptyText}</div>;
    }

    return (
        <div className="row">
            {courses.map(course => (
                <div key={course.id} className="col-md-4 mb-4">
                    <div className="card h-100">
                        <img
                            src={course.thumbnail || "/default-course.png"}
                            className="card-img-top"
                            alt={course.name}
                            style={{ objectFit: 'cover', height: 180, borderRadius: 6, background: "#eee" }}
                            onError={e => { e.target.onerror = null; e.target.src = "/default-course.png"; }}
                        />
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title">{course.name}</h5>
                            {course.description && (
                                <p className="card-text">{course.description}</p>
                            )}
                            {/* Dùng Link hoặc navigate tùy page */}
                            <button
                                className="btn btn-primary mt-auto"
                                onClick={() => navigate(`/course/${course.id}`)}
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Course;
