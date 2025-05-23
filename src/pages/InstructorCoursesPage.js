import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail, deleteCourse } from '../services/api';
import axios from 'axios';

// Simple Modal component
function ConfirmModal({ show, onClose, onConfirm, title, message }) {
    if (!show) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99
        }}>
            <div style={{
                background: '#fff', borderRadius: 8, padding: 24, minWidth: 320,
                boxShadow: '0 2px 16px #0002'
            }}>
                <h4>{title}</h4>
                <div style={{ margin: "20px 0" }}>{message}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Huỷ</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Xoá</button>
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
                // Lấy chi tiết khoá học
                const courseRes = await getCourseDetail(id, token);
                setCourse(courseRes.data?.data || courseRes.data);

                // Lấy danh sách bài học
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

    // Khi nhấn nút "Xoá khoá học"
    const handleDeleteClick = () => setShowDeleteModal(true);

    // Khi xác nhận xoá khoá học (Xoá tất cả lessons song song rồi mới xoá course)
    const handleDeleteCourse = async () => {
        setShowDeleteModal(false);
        const token = localStorage.getItem('accessToken');
        try {
            // Xoá tất cả lesson song song (Promise.all)
            await Promise.all(
                lessons.map(lesson =>
                    axios.delete(`http://localhost:8080/api/lessons/${lesson.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );
            // Sau đó xoá khoá học
            await deleteCourse(id, token);
            setMessage('Đã xoá khoá học thành công!');
            setTimeout(() => navigate('/instructor-dashboard'), 1000);
        } catch {
            setError('Xoá khoá học thất bại');
        }
    };

    // Chuyển tới trang sửa
    const handleEdit = () => {
        navigate(`/edit-course/${id}`);
    };

    // Chuyển tới trang thêm bài học
    const handleAddLesson = () => {
        navigate(`/course/${id}/add-lesson`);
    };

    // Khi nhấn xoá lesson thì show modal
    const handleDeleteLessonClick = (lesson) => {
        setLessonToDelete(lesson);
        setShowDeleteLessonModal(true);
    };

    // Khi xác nhận xoá lesson
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

    if (loading) return <div style={{ textAlign: "center", marginTop: 40 }}>Đang tải...</div>;
    if (error) return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
    if (!course) return <div style={{ textAlign: "center" }}>Không tìm thấy khoá học</div>;

    // Lấy trường tiêu đề/nội dung của lesson: ưu tiên name/title, description/content
    const getLessonTitle = (lesson) => lesson.name || lesson.title || "";
    const getLessonContent = (lesson) => lesson.description || lesson.content || "";

    return (
        <div style={{
            maxWidth: 800,
            margin: '40px auto',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 12px #eee',
            padding: 32
        }}>
            <h2 style={{ fontWeight: 700, textAlign: "center" }}>{course.name}</h2>
            <div style={{ margin: "16px 0", textAlign: "center" }}>
                <img src={course.thumbnail} alt={course.name} style={{ width: 300, borderRadius: 8, objectFit: "cover" }} />
            </div>
            <div style={{ textAlign: "center" }}>
                <div><b>Giá:</b> {course.price} VNĐ</div>
                <div><b>Trạng thái:</b> {course.status}</div>
                <div><b>Ngày tạo:</b> {course.createdAt ? new Date(course.createdAt).toLocaleString() : ""}</div>
                <div><b>Danh mục:</b> {course.categoryName}</div>
                <div><b>Giảng viên:</b> {course.instructorName}</div>
            </div>
            <div style={{ margin: '24px 0 10px', display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={handleEdit}>Sửa</button>
                <button className="btn btn-danger" onClick={handleDeleteClick}>Xoá</button>
                <button className="btn btn-success" onClick={handleAddLesson}>Thêm bài học</button>
            </div>
            {message && <div style={{ color: "green", marginTop: 12 }}>{message}</div>}

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
            <div style={{ marginTop: 36 }}>
                <h3 style={{ marginBottom: 16 }}>Bài học trong khoá học</h3>
                <table className="table" style={{ width: "100%", marginTop: 12 }}>
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Nội dung</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>Chưa có bài học nào</td>
                            </tr>
                        ) : lessons.map(lesson => (
                            <tr key={lesson.id}>
                                <td>{getLessonTitle(lesson)}</td>
                                <td style={{ maxWidth: 350, wordBreak: 'break-word' }}>{getLessonContent(lesson)}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary"
                                        onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
                                    >Sửa</button>
                                    &nbsp;
                                    <button className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeleteLessonClick(lesson)}
                                    >Xoá</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InstructorCoursePage;
