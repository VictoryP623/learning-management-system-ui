import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail, deleteCourse } from '../services/api';
import axios from 'axios';

// Simple Modal component (giữ như cũ)
function ConfirmModal({ show, onClose, onConfirm, title, message }) {
    if (!show) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.34)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: 28, minWidth: 320,
                boxShadow: '0 8px 40px #1677ff2a'
            }}>
                <h4 style={{ fontWeight: 700, color: '#1566c2', marginBottom: 16 }}>{title}</h4>
                <div style={{ margin: "12px 0 20px", color: "#263b50" }}>{message}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                    <button className="btn btn-light" onClick={onClose}
                        style={{ borderRadius: 10, fontWeight: 600, padding: "5px 18px" }}>Huỷ</button>
                    <button className="btn btn-danger" onClick={onConfirm}
                        style={{ borderRadius: 10, fontWeight: 700, padding: "5px 18px" }}>Xoá</button>
                </div>
            </div>
        </div>
    );
}

const InstructorCoursePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            try {
                const courseRes = await getCourseDetail(id, token);
                setCourse(courseRes.data?.data || courseRes.data);
                const lessonsRes = await axios.get(`http://localhost:8080/api/lessons?courseId=${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const rawLessons = lessonsRes.data?.data || lessonsRes.data || [];
                setLessons(Array.isArray(rawLessons) ? rawLessons : []);
            } catch (err) {
                setError('Không lấy được thông tin khoá học hoặc danh sách bài học');
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    // Delete actions
    const handleDeleteClick = () => setShowDeleteModal(true);
    const handleDeleteCourse = async () => {
        setShowDeleteModal(false);
        const token = localStorage.getItem('accessToken');
        try {
            await Promise.all(
                lessons.map(lesson =>
                    axios.delete(`http://localhost:8080/api/lessons/${lesson.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );
            await deleteCourse(id, token);
            setMessage('Đã xoá khoá học thành công!');
            setTimeout(() => navigate('/instructor-dashboard'), 1000);
        } catch {
            setError('Xoá khoá học thất bại');
        }
    };
    const handleEdit = () => navigate(`/edit-course/${id}`);
    const handleAddLesson = () => navigate(`/course/${id}/add-lesson`);
    const handleDeleteLessonClick = (lesson) => {
        setLessonToDelete(lesson);
        setShowDeleteLessonModal(true);
    };
    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;
        setShowDeleteLessonModal(false);
        const token = localStorage.getItem('accessToken');
        try {
            await axios.delete(`http://localhost:8080/api/lessons/${lessonToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(prev => prev.filter(l => l.id !== lessonToDelete.id));
            setLessonToDelete(null);
        } catch {
            alert('Xoá bài học thất bại!');
        }
    };

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)',
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 26, fontWeight: 700
        }}>
            Đang tải...
        </div>
    );
    if (error) return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
    if (!course) return <div style={{ textAlign: "center" }}>Không tìm thấy khoá học</div>;

    const getLessonTitle = (lesson) => lesson.name || lesson.title || "";
    const getLessonContent = (lesson) => lesson.description || lesson.content || "";

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            padding: "1px 0 40px 0"
        }}>
            <div style={{
                maxWidth: 850,
                margin: '0 auto',
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 8px 32px #1677ff15',
                padding: 36,
                marginTop: 46
            }}>
                <h2 style={{
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#1566c2",
                    letterSpacing: 0.5,
                    marginBottom: 22

                }}>
                    {course.name}
                </h2>
                <div style={{ margin: "12px 0 28px", textAlign: "center" }}>
                    <img src={course.thumbnail} alt={course.name} style={{
                        width: 330, height: 140, borderRadius: 13, objectFit: "cover", boxShadow: "0 4px 18px #1677ff18"
                    }} />
                </div>
                <div style={{
                    textAlign: "center",
                    color: "#3d4957",
                    marginBottom: 24,
                    fontSize: 18
                }}>
                    <div><b>Giá:</b> <span style={{ color: "#1677ff", fontWeight: 700 }}>{course.price} $</span></div>
                    <div><b>Trạng thái:</b> <span style={{
                        fontWeight: 600, color:
                            course.status === 'APPROVED' ? "#3ab054"
                                : course.status === 'REJECTED' ? "#eb2020" : "#1677ff"
                    }}>{course.status}</span></div>
                    <div><b>Ngày tạo:</b> {course.createdAt ? new Date(course.createdAt).toLocaleString() : ""}</div>
                    <div><b>Danh mục:</b> {course.categoryName}</div>
                    <div><b>Giảng viên:</b> {course.instructorName}</div>
                </div>
                <div style={{ margin: '0 0 18px', display: 'flex', gap: 12, justifyContent: "center" }}>
                    <button className="btn btn-primary"
                        style={{
                            fontWeight: 700, fontSize: 16, borderRadius: 13, padding: "8px 32px",
                            boxShadow: "0 2px 10px #1677ff22"
                        }}
                        onClick={handleEdit}>Sửa</button>
                    <button className="btn btn-danger"
                        style={{
                            fontWeight: 700, fontSize: 16, borderRadius: 13, padding: "8px 32px",
                            boxShadow: "0 2px 10px #eb202022"
                        }}
                        onClick={handleDeleteClick}>Xoá</button>
                    <button className="btn btn-success"
                        style={{
                            fontWeight: 700, fontSize: 16, borderRadius: 13, padding: "8px 32px",
                            boxShadow: "0 2px 10px #20bb4a22"
                        }}
                        onClick={handleAddLesson}>Thêm bài học</button>
                </div>
                {message && <div style={{ color: "#36b76c", marginTop: 8, fontWeight: 600, textAlign: "center" }}>{message}</div>}

                {/* Modal xác nhận xoá course */}
                <ConfirmModal
                    show={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteCourse}
                    title="Xoá khoá học"
                    message="Bạn chắc chắn muốn xoá khoá học này không? (Toàn bộ bài học trong khoá cũng sẽ bị xoá!)"
                />

                {/* Modal xác nhận xoá lesson */}
                <ConfirmModal
                    show={showDeleteLessonModal}
                    onClose={() => setShowDeleteLessonModal(false)}
                    onConfirm={handleDeleteLesson}
                    title="Xoá bài học"
                    message={`Bạn chắc chắn muốn xoá bài học "${getLessonTitle(lessonToDelete || {})}" không?`}
                />

                {/* Danh sách bài học */}
                <div style={{ marginTop: 34 }}>
                    <h3 style={{
                        marginBottom: 17,
                        fontWeight: 700,
                        color: "#1677ff",
                        letterSpacing: 0.1
                    }}>
                        Bài học trong khoá học
                    </h3>
                    <div style={{
                        background: "#f8faff",
                        borderRadius: 13,
                        boxShadow: "0 2px 16px #00306e0a",
                        padding: "10px 0 3px 0"
                    }}>
                        <table className="table"
                            style={{
                                width: "100%",
                                marginTop: 10,
                                background: "transparent"
                            }}>
                            <thead>
                                <tr style={{ color: "#1d3557", fontWeight: 600, fontSize: 17 }}>
                                    <th style={{ width: 170 }}>Tiêu đề</th>
                                    <th style={{ width: 340 }}>Nội dung</th>
                                    <th style={{ width: 150, textAlign: "center" }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessons.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>Chưa có bài học nào</td>
                                    </tr>
                                ) : lessons.map(lesson => (
                                    <tr key={lesson.id} style={{ fontSize: 16, color: "#263b50" }}>
                                        <td style={{ fontWeight: 600 }}>{getLessonTitle(lesson)}</td>
                                        <td style={{ maxWidth: 340, wordBreak: 'break-word', fontWeight: 400 }}>{getLessonContent(lesson)}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <button className="btn btn-sm btn-outline-primary"
                                                style={{
                                                    borderRadius: 8,
                                                    fontWeight: 600,
                                                    padding: "4px 18px",
                                                    marginRight: 5
                                                }}
                                                onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
                                            >Sửa</button>
                                            <button className="btn btn-sm btn-outline-danger"
                                                style={{
                                                    borderRadius: 8,
                                                    fontWeight: 600,
                                                    padding: "4px 18px"
                                                }}
                                                onClick={() => handleDeleteLessonClick(lesson)}
                                            >Xoá</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorCoursePage;
