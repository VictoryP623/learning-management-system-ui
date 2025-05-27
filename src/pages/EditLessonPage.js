import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateFileType } from '../services/api';
import QuizList from '../components/QuizList';

function EditLessonPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [resourceName, setResourceName] = useState('');
    const [resource, setResource] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        axios.get(`http://localhost:8080/api/lessons/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setLesson(res.data?.data || res.data))
            .catch(() => setError('Không lấy được thông tin bài học!'));
        axios.get(`http://localhost:8080/api/lesson-resources?lessonId=${id}&page=0&limit=1`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const resources = res.data?.data || res.data.content || [];
                if (resources.length) setResource(resources[0]);
                else setResource(null);
            })
            .catch(() => { });
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLesson(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        const { valid, error } = validateFileType(selected);
        if (!valid) {
            setFileError(error);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else {
            setFileError('');
            setFile(selected);
        }
    };

    const handleDeleteResource = async () => {
        if (!resource) return;
        const token = localStorage.getItem('accessToken');
        try {
            await axios.delete(`http://localhost:8080/api/lesson-resources/${resource.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResource(null);
            setResourceName('');
            setSuccess('Đã xoá tài liệu!');
        } catch {
            setError('Lỗi xoá file!');
        }
    };

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
        if (fileError) return;
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

    if (error) return <div style={{
        minHeight: "75vh",
        background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "red", fontWeight: 700, fontSize: 22
    }}>{error}</div>;
    if (!lesson) return <div style={{
        minHeight: "75vh",
        background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: 22
    }}>Đang tải...</div>;

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            padding: "50px 0"
        }}>
            <div style={{
                maxWidth: 540,
                margin: "0 auto",
                padding: "38px 32px 32px 32px",
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 8px 32px #1677ff16"
            }}>
                <h2 style={{
                    textAlign: "center",
                    fontWeight: 800,
                    marginBottom: 28,
                    color: "#1566c2"
                }}>Sửa bài học</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 19 }}>
                        <label style={{ fontWeight: 600, marginBottom: 5, display: "block" }}>Tiêu đề bài học:</label>
                        <input
                            className="form-control"
                            name="name"
                            value={lesson.name || ''}
                            onChange={handleChange}
                            required
                            style={{ padding: 10, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập tiêu đề bài học"
                        />
                    </div>
                    <div style={{ marginBottom: 19 }}>
                        <label style={{ fontWeight: 600, marginBottom: 5, display: "block" }}>Nội dung:</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={lesson.description || ''}
                            onChange={handleChange}
                            required
                            rows={5}
                            style={{ padding: 10, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập nội dung bài học"
                        />
                    </div>
                    <div style={{ marginBottom: 19 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>
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
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>Tài liệu bài học (tùy chọn):</label>
                        {resource ? (
                            <div style={{
                                background: "#f8fcff",
                                padding: "10px 13px",
                                borderRadius: 10,
                                marginBottom: 8,
                                display: "flex", alignItems: "center", justifyContent: "space-between"
                            }}>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{
                                    color: "#1677ff", fontWeight: 600, textDecoration: "underline"
                                }}>
                                    {resource.name || "Tài liệu đã upload"} ({resource.url.split('.').pop()})
                                </a>
                                <button type="button" className="btn btn-danger btn-sm"
                                    style={{
                                        fontWeight: 600, marginLeft: 8, borderRadius: 9, padding: "2px 12px"
                                    }}
                                    onClick={handleDeleteResource}>
                                    Xoá
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    style={{ marginBottom: 7 }}
                                />
                                {fileError && <div style={{ color: 'red', marginTop: 4, fontSize: 15 }}>{fileError}</div>}
                                <input
                                    className="form-control mt-2"
                                    placeholder="Tên tài liệu (hiển thị)"
                                    value={resourceName}
                                    onChange={e => setResourceName(e.target.value)}
                                    style={{ marginTop: 7, padding: 9, borderRadius: 8 }}
                                />
                            </div>
                        )}
                    </div>
                    <button className="btn btn-primary" type="submit"
                        style={{
                            width: "100%",
                            fontWeight: 700,
                            padding: "11px 0",
                            borderRadius: 11,
                            fontSize: 18,
                            marginTop: 7,
                            boxShadow: "0 2px 13px #1677ff22"
                        }}
                    >
                        Cập nhật bài học
                    </button>
                    {success && <div style={{ color: "#1cb061", marginTop: 18, textAlign: "center", fontWeight: 600 }}>{success}</div>}
                    {error && <div style={{ color: "red", marginTop: 15, textAlign: "center", fontWeight: 600 }}>{error}</div>}
                </form>

                {/* Quản lý Quiz */}
                <div style={{ marginTop: 30 }}>
                    <QuizList lessonId={id} isEditing={true} />
                </div>
            </div>
        </div>
    );
}

export default EditLessonPage;
