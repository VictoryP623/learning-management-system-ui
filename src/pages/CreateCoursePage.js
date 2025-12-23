import React, { useState, useEffect } from 'react';
import { createCourse } from '../services/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateCoursePage() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        axios.get('http://localhost:8081/api/categories', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            let cats = [];
            if (Array.isArray(res.data?.data)) cats = res.data.data;
            else if (Array.isArray(res.data?.data?.data)) cats = res.data.data.data;
            else if (Array.isArray(res.data)) cats = res.data;
            setCategories(cats);
        }).catch(() => setCategories([]));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseFloat(price) < 1) {
            setError("Giá phải trên 0 $");
            return;
        }
        const token = localStorage.getItem('accessToken');
        try {
            await createCourse({ name, price, thumbnail, categoryId }, token);
            navigate('/instructor-dashboard');
        } catch (err) {
            if (err.response && err.response.data) {
                if (err.response.data.data) {
                    const detail = err.response.data.data.price ? err.response.data.data.price[0] : '';
                    setError(detail || err.response.data.error || 'Tạo khóa học thất bại');
                } else if (err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError('Tạo khóa học thất bại');
                }
            } else {
                setError('Tạo khóa học thất bại');
            }
        }
    };

    return (
        <div
            style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px 0",
            }}
        >
            <div style={{
                maxWidth: 480,
                width: "100%",
                margin: "auto",
                padding: "38px 32px 30px 32px",
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 8px 38px #1566c226",
                position: "relative"
            }}>
                <h2 style={{
                    textAlign: "center",
                    fontWeight: 700,
                    marginBottom: 32,
                    color: "#1566c2",
                    letterSpacing: 0.3
                }}>
                    Tạo Khoá Học Mới
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 600, marginBottom: 4, color: "#223b5a" }}>Tên khoá học:</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            style={{
                                marginTop: 5,
                                padding: "10px 12px",
                                borderRadius: 10,
                                fontSize: 16,
                                border: "1.5px solid #dde3f3"
                            }}
                            placeholder="Nhập tên khoá học"
                        />
                    </div>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 600, marginBottom: 4, color: "#223b5a" }}>Giá (USD):</label>
                        <input
                            className="form-control"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            required
                            type="number"
                            min="0"
                            style={{
                                marginTop: 5,
                                padding: "10px 12px",
                                borderRadius: 10,
                                fontSize: 16,
                                border: "1.5px solid #dde3f3"
                            }}
                            placeholder="Nhập giá"
                        />
                    </div>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 600, marginBottom: 4, color: "#223b5a" }}>Thumbnail URL:</label>
                        <input
                            className="form-control"
                            value={thumbnail}
                            onChange={e => setThumbnail(e.target.value)}
                            required
                            style={{
                                marginTop: 5,
                                padding: "10px 12px",
                                borderRadius: 10,
                                fontSize: 16,
                                border: "1.5px solid #dde3f3"
                            }}
                            placeholder="Dán URL hình ảnh"
                        />
                    </div>
                    <div style={{ marginBottom: 30 }}>
                        <label style={{ fontWeight: 600, marginBottom: 4, color: "#223b5a" }}>Danh mục:</label>
                        <select
                            className="form-control"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            required
                            style={{
                                marginTop: 5,
                                padding: "10px 12px",
                                borderRadius: 10,
                                fontSize: 16,
                                border: "1.5px solid #dde3f3"
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
                        padding: "13px 0",
                        borderRadius: 12,
                        fontSize: 17,
                        letterSpacing: 0.3,
                        background: "#1677ff",
                        border: "none",
                        boxShadow: "0 2px 16px #1677ff18"
                    }}>Tạo khoá học</button>
                    {error && <div style={{
                        color: "#f44336",
                        marginTop: 18,
                        textAlign: "center",
                        fontWeight: 500
                    }}>{error}</div>}
                </form>
            </div>
        </div>
    );
}

export default CreateCoursePage;
