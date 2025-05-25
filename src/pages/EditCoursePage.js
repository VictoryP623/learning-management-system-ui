import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditLessonPage() {
    const { id } = useParams(); // lessonId
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        axios.get(`http://localhost:8080/api/lessons/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setLesson(res.data?.data || res.data);
            })
            .catch(() => setError('Không lấy được thông tin bài học!'));
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLesson(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const token = localStorage.getItem('accessToken');
        try {
            await axios.patch(`http://localhost:8080/api/lessons/${id}`, {
                name: lesson.name,
                description: lesson.description,
                courseId: lesson.courseId,
                isFree: lesson.isFree
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Đã cập nhật bài học thành công!');
            setTimeout(() => {
                navigate(`/instructor/course/${lesson.courseId}`);
            }, 1200);
        } catch (err) {
            let message = 'Cập nhật thất bại!';
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.data && typeof data.data === 'object') {
                    message = Object.entries(data.data)
                        .map(([key, arr]) => arr.join(', '))
                        .join(' | ');
                } else if (data.error) {
                    message = data.error;
                }
            }
            setError(message);
        }
    };

    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!lesson) return <div>Đang tải...</div>;

    return (
        <div style={{
            maxWidth: 500,
            margin: "40px auto",
            padding: 32,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 12px #eee"
        }}>
            <h2 style={{ marginBottom: 24 }}>Sửa bài học</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label><b>Tiêu đề bài học:</b></label>
                    <input
                        className="form-control"
                        name="name"
                        value={lesson.name || ''}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                        placeholder="Nhập tiêu đề bài học"
                    />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label><b>Nội dung:</b></label>
                    <textarea
                        className="form-control"
                        name="description"
                        value={lesson.description || ''}
                        onChange={handleChange}
                        required
                        rows={5}
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                        placeholder="Nhập nội dung bài học"
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        <input
                            type="checkbox"
                            name="isFree"
                            checked={lesson.isFree || false}
                            onChange={handleChange}
                            style={{ marginRight: 8 }}
                        />
                        Miễn phí xem trước
                    </label>
                </div>
                <button className="btn btn-primary" type="submit">Cập nhật bài học</button>
                {success && <div style={{ color: "green", marginTop: 16 }}>{success}</div>}
                {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
            </form>
        </div>
    );
}

export default EditLessonPage;
