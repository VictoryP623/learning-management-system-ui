import React, { useEffect, useState } from 'react';
import { getUserProfile, getInstructorIdByUserId, getInstructorCourses } from '../services/api';
import { useNavigate } from 'react-router-dom';

function InstructorDashboardPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        getUserProfile(token)
            .then(user => {
                if (!user || !user.id) {
                    setError('Không lấy được userId');
                    setLoading(false);
                    return;
                }
                const userId = user.id;
                return getInstructorIdByUserId(token, userId);
            })
            .then(instructorObj => {
                const instructorId = instructorObj && instructorObj.id ? instructorObj.id : instructorObj;
                if (!instructorId) return;
                return getInstructorCourses(token, instructorId);
            })
            .then(res => {
                if (!res || !res.data) return;
                const myCourses = res.data.data || [];
                setCourses(myCourses);
                setLoading(false);
            })
            .catch(() => {
                setError('Không lấy được danh sách khóa học');
                setLoading(false);
            });
    }, []);


    if (loading) return <div className="dashboard-loading">Đang tải...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Instructor Dashboard</h2>
                <button className="btn-primary" onClick={() => navigate('/create-course')}>+ Add New Course</button>
            </div>
            <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Tên khóa học</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center" }}>No courses found.</td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id}>
                                    <td>{course.name}</td>
                                    <td>
                                        <span className={`status status-${course.status?.toLowerCase()}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td>{course.createdAt ? new Date(course.createdAt).toLocaleString() : ''}</td>
                                    <td>
                                        <button
                                            className="btn-action"
                                            onClick={() => navigate(`/instructor/course/${course.id}`)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InstructorDashboardPage;