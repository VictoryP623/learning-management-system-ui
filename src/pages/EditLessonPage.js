import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditLessonPage() {
    const { id } = useParams(); // lessonId
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [file, setFile] = useState(null);
    const [resourceName, setResourceName] = useState('');

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

    // Hàm upload file (tuỳ chọn)
    const uploadFile = async () => {
        if (!file) return;
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('resourceName', resourceName || file.name);
        try {
            await axios.post(
                `http://localhost:8080/api/lesson-resources?lessonId=${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
        } catch (err) {
            setError('Tải file lên thất bại!');
        }
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
            // Upload file nếu có
            if (file) {
                await uploadFile();
            }
            setSuccess('Đã cập nhật bài học thành công!');
            setTimeout(() => {
                navigate(`/instructor/course/${lesson.courseId}`);
            }, 1200);
        } catch (err) {
            setError('Cập nhật thất bại!');
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
                <div style={{ marginBottom: 16 }}>
                    <label><b>Tài liệu bài học (tùy chọn):</b></label>
                    <input
                        type="file"
                        className="form-control"
                        onChange={e => setFile(e.target.files[0])}
                    />
                    <input
                        className="form-control mt-2"
                        placeholder="Tên tài liệu (hiển thị)"
                        value={resourceName}
                        onChange={e => setResourceName(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" type="submit">Cập nhật bài học</button>
                {success && <div style={{ color: "green", marginTop: 16 }}>{success}</div>}
                {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
            </form>
        </div>
    );
}

export default EditLessonPage;
