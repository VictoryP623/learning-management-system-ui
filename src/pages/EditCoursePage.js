import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditCoursePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [initError, setInitError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        axios.get(`http://localhost:8081/api/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setCourse(res.data?.data || res.data || {});
        }).catch(() => setInitError('Không lấy được thông tin khoá học!'));

        axios.get('http://localhost:8081/api/categories', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            let cats = [];
            if (Array.isArray(res.data?.data?.data)) cats = res.data.data.data;
            else if (Array.isArray(res.data?.data)) cats = res.data.data;
            else if (Array.isArray(res.data)) cats = res.data;
            setCategories(cats);
        }).catch(() => setCategories([]));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const token = localStorage.getItem('accessToken');
        try {
            await axios.put(`http://localhost:8081/api/courses/${id}`, {
                name: course.name,
                price: course.price,
                thumbnail: course.thumbnail,
                categoryId: course.categoryId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Đã cập nhật khoá học thành công!');
            setTimeout(() => navigate(`/instructor/course/${id}`), 1200);
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

    if (!course && !initError) return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg, #1677ff 0%, #49c6e5 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 22, fontWeight: 700
        }}>
            Đang tải...
        </div>
    );

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg, #1677ff 0%, #49c6e5 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "32px 0"
        }}>
            <div style={{
                width: "100%",
                maxWidth: 520,
                margin: "auto",
                padding: 36,
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 28px 0 #1677ff25"
            }}>
                <h2 style={{
                    textAlign: "center",
                    fontWeight: 800,
                    marginBottom: 26,
                    color: "#1566c2",
                    letterSpacing: 0.2
                }}>
                    Sửa thông tin khoá học
                </h2>
                {initError && <div style={{ color: "red", textAlign: "center", marginBottom: 18 }}>{initError}</div>}
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Tên khoá học:</label>
                        <input
                            className="form-control"
                            name="name"
                            value={course?.name || ''}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "11px 12px",
                                borderRadius: 9,
                                border: "1px solid #d2e3ff",
                                background: "#f5f8ff",
                                fontSize: 17
                            }}
                            placeholder="Nhập tên khoá học"
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Giá (USD):</label>
                        <input
                            className="form-control"
                            type="number"
                            name="price"
                            value={course?.price || ''}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "11px 12px",
                                borderRadius: 9,
                                border: "1px solid #d2e3ff",
                                background: "#f5f8ff",
                                fontSize: 17
                            }}
                            placeholder="Nhập giá"
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Thumbnail URL:</label>
                        <input
                            className="form-control"
                            name="thumbnail"
                            value={course?.thumbnail || ''}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "11px 12px",
                                borderRadius: 9,
                                border: "1px solid #d2e3ff",
                                background: "#f5f8ff",
                                fontSize: 17
                            }}
                            placeholder="Dán URL hình ảnh"
                        />
                    </div>
                    <div style={{ marginBottom: 26 }}>
                        <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Danh mục:</label>
                        <select
                            className="form-control"
                            name="categoryId"
                            value={course?.categoryId || ""}
                            onChange={handleChange}
                            required
                            style={{
                                width: "100%",
                                padding: "11px 12px",
                                borderRadius: 9,
                                border: "1px solid #d2e3ff",
                                background: "#f5f8ff",
                                fontSize: 17
                            }}
                        >
                            <option value="">-- Chọn --</option>
                            {(categories || []).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn btn-primary" type="submit" style={{
                        width: "100%",
                        fontWeight: 700,
                        fontSize: 18,
                        padding: "12px 0",
                        borderRadius: 12,
                        background: "#1677ff",
                        border: "none",
                        boxShadow: "0 2px 12px #1677ff18",
                        transition: "background 0.15s"
                    }}>
                        Cập nhật khoá học
                    </button>
                    {error && <div style={{ color: "red", marginTop: 17, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
                    {success && <div style={{ color: "green", marginTop: 17, textAlign: 'center', fontWeight: 600 }}>{success}</div>}
                </form>
            </div>
        </div>
    );
}

export default EditCoursePage;
