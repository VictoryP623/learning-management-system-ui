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
        axios.get('http://localhost:8080/api/categories', {
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
        if (parseFloat(price) < 1000) {
            setError("Giá khoá học phải tối thiểu 1000 VND");
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
        <div style={{
            maxWidth: 520,
            margin: "48px auto 0 auto",
            padding: 32,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 14px #e0e7ef"
        }}>
            <h2 style={{
                textAlign: "center",
                fontWeight: 700,
                marginBottom: 28
            }}>Tạo Khoá Học Mới</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 500 }}>Tên khoá học:</label>
                    <input
                        className="form-control"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={{ marginTop: 5, padding: 9 }}
                        placeholder="Nhập tên khoá học"
                    />
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 500 }}>Giá (VND):</label>
                    <input
                        className="form-control"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        required
                        type="number"
                        min="0"
                        style={{ marginTop: 5, padding: 9 }}
                        placeholder="Nhập giá"
                    />
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 500 }}>Thumbnail URL:</label>
                    <input
                        className="form-control"
                        value={thumbnail}
                        onChange={e => setThumbnail(e.target.value)}
                        required
                        style={{ marginTop: 5, padding: 9 }}
                        placeholder="Dán URL hình ảnh"
                    />
                </div>
                <div style={{ marginBottom: 24 }}>
                    <label style={{ fontWeight: 500 }}>Danh mục:</label>
                    <select
                        className="form-control"
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        required
                        style={{ marginTop: 5, padding: 9 }}
                    >
                        <option value="">-- Chọn --</option>
                        {(categories || []).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary" type="submit" style={{
                    width: "100%",
                    fontWeight: 600,
                    padding: "10px 0"
                }}>Tạo khoá học</button>
                {error && <div style={{ color: "red", marginTop: 15, textAlign: "center" }}>{error}</div>}
            </form>
        </div>
    );
}

export default CreateCoursePage;
