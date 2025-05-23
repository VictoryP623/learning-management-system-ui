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
    const [initError, setInitError] = useState(''); // lỗi khi lấy data ban đầu

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        // Lấy thông tin khoá học
        axios.get(`http://localhost:8080/api/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setCourse(res.data?.data || res.data || {});
        }).catch(() => setInitError('Không lấy được thông tin khoá học!'));

        // Lấy danh sách category
        axios.get('http://localhost:8080/api/categories', {
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
            await axios.put(`http://localhost:8080/api/courses/${id}`, {
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

    // Loading
    if (!course && !initError) return <div>Đang tải...</div>;

    return (
        <div style={{
            maxWidth: 600,
            margin: "40px auto",
            padding: 32,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 12px #eee"
        }}>
            <h2 style={{ marginBottom: 24, textAlign: "center" }}>Sửa thông tin khoá học</h2>
            {/* Hiện lỗi khi lấy dữ liệu ban đầu */}
            {initError && <div style={{ color: "red", textAlign: "center", marginBottom: 16 }}>{initError}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                    <label><b>Tên khoá học:</b></label>
                    <input
                        className="form-control"
                        name="name"
                        value={course?.name || ''}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                    />
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label><b>Giá (VND):</b></label>
                    <input
                        className="form-control"
                        type="number"
                        name="price"
                        value={course?.price || ''}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                    />
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label><b>Thumbnail URL:</b></label>
                    <input
                        className="form-control"
                        name="thumbnail"
                        value={course?.thumbnail || ''}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                    />
                </div>
                <div style={{ marginBottom: 14 }}>
                    <label><b>Danh mục:</b></label>
                    <select
                        className="form-control"
                        name="categoryId"
                        value={course?.categoryId || ""}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 3 }}
                    >
                        <option value="">-- Chọn --</option>
                        {(categories || []).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary" type="submit">Cập nhật khoá học</button>
                {/* HIỂN THỊ THÔNG BÁO NGAY DƯỚI BUTTON */}
                {error && <div style={{ color: "red", marginTop: 15, textAlign: 'center' }}>{error}</div>}
                {success && <div style={{ color: "green", marginTop: 15, textAlign: 'center' }}>{success}</div>}
            </form>
        </div>
    );
}

export default EditCoursePage;
