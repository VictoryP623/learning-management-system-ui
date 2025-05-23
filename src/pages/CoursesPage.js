import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/api';  // Import hàm getCourses từ api.js

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);  // Lưu danh sách khóa học
    const [loading, setLoading] = useState(true);  // Quản lý trạng thái loading

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Gọi hàm với params!
                const data = await getCourses({ page: 0, limit: 99 });
                setCourses(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return <div>Loading...</div>;  // Hiển thị khi đang lấy dữ liệu
    }

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Courses</h2>
            <div className="row">
                {courses.length === 0 ? (
                    <div className="col-12">
                        <p>No courses found.</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <div className="col-md-4 mb-4" key={course.id}>
                            <div className="card">
                                <img
                                    src={course.thumbnail ? course.thumbnail : "/default-course.png"}
                                    className="card-img-top"
                                    alt={course.name}
                                    style={{ objectFit: "cover", height: 180, borderRadius: 6, background: "#eee" }}
                                    onError={e => { e.target.onerror = null; e.target.src = "/default-course.png"; }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{course.name}</h5>
                                    {/* Ẩn description nếu không có dữ liệu */}
                                    {course.description && (
                                        <p className="card-text">{course.description}</p>
                                    )}
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
