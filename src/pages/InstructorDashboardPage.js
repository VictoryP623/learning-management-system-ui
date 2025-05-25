import React, { useEffect, useState } from 'react';
import { getUserProfile, getInstructorIdByUserId, getInstructorCourses } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function InstructorDashboardPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleResubmit = async (courseId) => {
        const token = localStorage.getItem('accessToken');
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/courses/${courseId}/resubmit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Load lại danh sách (giống logic cũ)
            const user = await getUserProfile(token);
            const userId = user.id;
            const instructorObj = await getInstructorIdByUserId(token, userId);
            const instructorId = instructorObj && instructorObj.id ? instructorObj.id : instructorObj;
            if (!instructorId) return;
            const res = await getInstructorCourses(token, instructorId);
            const myCourses = res.data.data || [];
            setCourses(myCourses);
        } catch {
            alert('Không gửi lại được khóa học!');
        }
    };

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
                console.log('Courses API trả về:', myCourses); // <--- Ở đây
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
                                        {course.status === "REJECTED" && (
                                            <div style={{ color: 'red', marginTop: 5 }}>
                                                <div>
                                                    <b></b>
                                                    {/* Nếu rejectedReason tồn tại thì hiện ra */}
                                                    {course.rejectedReason && (
                                                        <span> Lý do: {course.rejectedReason || "(Không có lý do)"}</span>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleResubmit(course.id)}
                                                    style={{ marginTop: 3 }}
                                                >
                                                    Gửi lại xét duyệt
                                                </button>
                                            </div>
                                        )}
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