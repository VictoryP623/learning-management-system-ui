import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddLessonPage() {
    const { id } = useParams(); // id là courseId
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        try {
            await axios.post(`http://localhost:8080/api/lessons`, {
                name,
                description,
                courseId: id // phải truyền courseId vào body!
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Thêm bài học thành công!');
            setError('');
            setTimeout(() => navigate(`/instructor/course/${id}`), 1200);
        } catch {
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
                    <input
                        className="form-control"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                        placeholder="Nhập tiêu đề bài học"
                    />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label><b>Nội dung:</b></label>
                    <textarea
                        className="form-control"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        rows={5}
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                        placeholder="Nhập nội dung bài học"
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
