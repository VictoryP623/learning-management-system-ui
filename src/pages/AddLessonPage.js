import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddLessonPage() {
    const { id } = useParams(); // id là courseId
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [file, setFile] = useState(null);
    const [resourceName, setResourceName] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Hàm upload file sau khi tạo lesson thành công
    const uploadFile = async (lessonId) => {
        if (!file) return;
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('resourceName', resourceName || file.name);
        try {
            await axios.post(
                `http://localhost:8080/api/lesson-resources?lessonId=${lessonId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
        } catch (err) {
            // Có thể báo lỗi nếu cần
            setError('Tải file lên thất bại!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const token = localStorage.getItem('accessToken');
        try {
            // B1: Tạo lesson mới
            const response = await axios.post(`http://localhost:8080/api/lessons`, {
                name,
                description,
                courseId: id,
                isFree
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Thêm bài học thành công!');
            setError('');
            const lessonId = response.data?.data?.id || response.data?.id; // tuỳ theo response BE

            // B2: Nếu có file, upload file
            if (lessonId && file) {
                await uploadFile(lessonId);
            }
            setTimeout(() => navigate(`/instructor/course/${id}`), 1200);
        } catch (err) {
            setError('Thêm bài học thất bại!');
            setSuccess('');
        }
    };

    return (
        <div style={{
            maxWidth: 500,
            margin: "40px auto",
            padding: 32,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 12px #eee"
        }}>
            <h2 style={{ marginBottom: 24 }}>Thêm bài học mới</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label><b>Tiêu đề bài học:</b></label>
                    <input className="form-control" value={name}
                        onChange={e => setName(e.target.value)}
                        required style={{ width: "100%", padding: 8, marginTop: 3 }}
                        placeholder="Nhập tiêu đề bài học" />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label><b>Nội dung:</b></label>
                    <textarea className="form-control" value={description}
                        onChange={e => setDescription(e.target.value)}
                        required rows={5}
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                        placeholder="Nhập nội dung bài học" />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isFree}
                            onChange={e => setIsFree(e.target.checked)}
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
                <button className="btn btn-success" type="submit">Thêm bài học</button>
            </form>
            {success && <div style={{ color: "green", marginTop: 16 }}>{success}</div>}
            {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
        </div>
    );
}

export default AddLessonPage;
