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
            // Reload courses
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
                setCourses(myCourses);
                setLoading(false);
            })
            .catch(() => {
                setError('Không lấy được danh sách khóa học');
                setLoading(false);
            });
    }, []);

    if (loading)
        return (
            <div style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 26
            }}>
                Đang tải...
            </div>
        );
    if (error)
        return (
            <div style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 22
            }}>
                {error}
            </div>
        );

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            padding: "0 0 64px 0"
        }}>
            <div style={{
                maxWidth: 1100,
                margin: "0 auto",
                padding: "44px 0 0 0"
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: "0 10px 38px #1566c222",
                    padding: "32px 34px",
                    marginBottom: 40,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 18
                    }}>
                        <h2 style={{
                            color: "#1566c2",
                            fontWeight: 800,
                            letterSpacing: 0.1
                        }}>Instructor Dashboard</h2>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                className="btn btn-primary"
                                style={{
                                    fontWeight: 700,
                                    borderRadius: 14,
                                    background: "#1677ff",
                                    border: "none",
                                    padding: "8px 28px",
                                    fontSize: 16,
                                    boxShadow: "0 2px 12px #1677ff19"
                                }}
                                onClick={() => navigate('/create-course')}
                            >
                                + Thêm khoá học
                            </button>
                            <button
                                className="btn btn-success"
                                style={{
                                    fontWeight: 700,
                                    borderRadius: 14,
                                    padding: "8px 22px",
                                    fontSize: 16,
                                    border: "1.5px solid #1ecb72",
                                    background: "#fff",
                                    color: "#1ecb72"
                                }}
                                onClick={() => navigate('/instructor/statistics')}
                            >
                                Thống kê doanh số
                            </button>
                        </div>
                    </div>

                    <div style={{
                        overflowX: "auto",
                        borderRadius: 12,
                        boxShadow: "0 2px 8px #e9f0ff23"
                    }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 17,
                            background: "#fafdff",
                            borderRadius: 12,
                            overflow: "hidden",
                        }}>
                            <thead>
                                <tr style={{ background: "#e7f1ff" }}>
                                    <th style={thStyle}>Tên khóa học</th>
                                    <th style={thStyle}>Trạng thái</th>
                                    <th style={thStyle}>Ngày tạo</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{
                                            textAlign: "center",
                                            color: "#aaa",
                                            fontWeight: 500,
                                            padding: 32,
                                            fontSize: 18
                                        }}>No courses found.</td>
                                    </tr>
                                ) : (
                                    courses.map((course) => (
                                        <tr key={course.id} style={{
                                            background: course.status === "REJECTED" ? "#ffeaea" : "#fff"
                                        }}>
                                            {/* Tên khoá học căn lề trái */}
                                            <td style={{ ...tdStyle, textAlign: "left" }}>{course.name}</td>
                                            {/* Trạng thái */}
                                            <td style={tdStyle}>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: course.status === "APPROVED"
                                                        ? "#26be72"
                                                        : course.status === "PENDING"
                                                            ? "#f0ad4e"
                                                            : course.status === "REJECTED"
                                                                ? "#e53935"
                                                                : "#23262a"
                                                }}>
                                                    {course.status}
                                                </span>
                                                {course.status === "REJECTED" && (
                                                    <div style={{ color: 'red', marginTop: 5, fontWeight: 500 }}>
                                                        <span>Lý do: {course.rejectedReason || "(Không có lý do)"}</span>
                                                        <br />
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleResubmit(course.id)}
                                                            style={{
                                                                marginTop: 6,
                                                                padding: "3px 16px",
                                                                borderRadius: 10,
                                                                border: "1.5px solid #1677ff",
                                                                background: "#fff",
                                                                color: "#1677ff",
                                                                fontWeight: 700,
                                                                fontSize: 15,
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            Gửi lại xét duyệt
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            {/* Ngày tạo */}
                                            <td style={tdStyle}>{course.createdAt ? new Date(course.createdAt).toLocaleString() : ''}</td>
                                            {/* Action */}
                                            <td style={tdStyle}>
                                                <button
                                                    className="btn-action"
                                                    style={{
                                                        border: "1.5px solid #1677ff",
                                                        background: "#f6fafd",
                                                        color: "#1677ff",
                                                        borderRadius: 10,
                                                        padding: "5px 18px",
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={() => navigate(`/instructor/course/${course.id}`)}>
                                                    Xem
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Table cell & header styles
const thStyle = {
    textAlign: "left",
    padding: "18px 18px",
    background: "#e7f1ff",
    fontWeight: 700,
    fontSize: 17,
    color: "#1566c2",
    letterSpacing: 0.2,
    borderBottom: "2px solid #e2eaf5"
};
const tdStyle = {
    padding: "18px 18px",
    borderBottom: "1.2px solid #f0f4fa",
    background: "#fff",
    fontWeight: 500
};

export default InstructorDashboardPage;
