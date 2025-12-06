import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateFileType, getLessonsByCourse } from '../services/api';

function AddLessonPage() {
    const { id } = useParams(); // id là courseId
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isFree, setIsFree] = useState(false);

    // NEW: các field điều kiện & thời lượng
    const [durationSec, setDurationSec] = useState('');
    const [unlockType, setUnlockType] = useState('NONE');
    const [requiredLessonId, setRequiredLessonId] = useState('');
    const [existingLessons, setExistingLessons] = useState([]);

    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [resourceName, setResourceName] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [newLessonId, setNewLessonId] = useState(null);
    const fileInputRef = useRef(null);

    // Lấy danh sách lesson hiện có trong course để chọn requiredLessonId
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;
                const res = await getLessonsByCourse(id, token);
                setExistingLessons(Array.isArray(res.data) ? res.data : []);
            } catch {
                setExistingLessons([]);
            }
        };
        if (id) fetchLessons();
    }, [id]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        const { valid, error } = validateFileType(selected);
        if (!valid) {
            setFileError(error);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            setFileError('');
            setFile(selected);
        }
    };

    const uploadFile = async (lessonId) => {
        if (!file) return;
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        // BE của bạn hiện đang nhận param "file" trong controller lesson-resources
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
            setError('Tải file lên thất bại!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (fileError) return;

        // Validate logic unlock
        if (unlockType === 'SPECIFIC_LESSON_COMPLETED' && !requiredLessonId) {
            setError('Hãy chọn bài học cần hoàn thành trước (Required Lesson).');
            return;
        }

        const token = localStorage.getItem('accessToken');

        // Chuẩn bị payload đúng với LessonRequestDto mới
        const payload = {
            name,
            description,
            courseId: id,
            isFree,
            // tuỳ BE bạn map videoUrl/resourceUrl, nếu chưa dùng video chính thì cho null hoặc để BE default
            resourceUrl: null,
            durationSec: durationSec ? Number(durationSec) : null,
            unlockType,
            requiredLessonId:
                unlockType === 'SPECIFIC_LESSON_COMPLETED' && requiredLessonId
                    ? Number(requiredLessonId)
                    : null
        };

        try {
            const response = await axios.post(
                `http://localhost:8080/api/lessons`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setSuccess('Thêm bài học thành công!');
            setError('');
            const lessonId = response.data?.data?.id || response.data?.id;
            setNewLessonId(lessonId);
            if (lessonId && file) {
                await uploadFile(lessonId);
            }
        } catch (err) {
            console.error(err);
            setError('Thêm bài học thất bại!');
            setSuccess('');
        }
    };

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg, #1677ff 0%, #49c6e5 100%)",
            padding: "60px 0"
        }}>
            <div style={{
                maxWidth: 520,
                margin: "0 auto",
                background: "#fff",
                padding: "38px 30px 32px 30px",
                borderRadius: 18,
                boxShadow: "0 8px 32px #1677ff22"
            }}>
                <h2 style={{
                    textAlign: "center",
                    fontWeight: 800,
                    color: "#1566c2",
                    marginBottom: 26
                }}>
                    Thêm bài học mới
                </h2>
                <form onSubmit={handleSubmit}>
                    {/* Tiêu đề */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>Tiêu đề bài học:</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            style={{ marginTop: 5, padding: 11, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập tiêu đề bài học"
                        />
                    </div>

                    {/* Nội dung */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>Nội dung:</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            rows={5}
                            style={{ marginTop: 5, padding: 11, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập nội dung bài học"
                        />
                    </div>

                    {/* Miễn phí */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600 }}>
                            <input
                                type="checkbox"
                                checked={isFree}
                                onChange={e => setIsFree(e.target.checked)}
                                style={{ marginRight: 10 }}
                            />
                            Miễn phí xem trước
                        </label>
                    </div>

                    {/* NEW: Thời lượng & Rule mở khóa */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>
                            Thời lượng bài học (giây):
                        </label>
                        <input
                            type="number"
                            min={0}
                            className="form-control"
                            value={durationSec}
                            onChange={e => setDurationSec(e.target.value)}
                            placeholder="VD: 600 (10 phút)"
                            style={{ marginTop: 5, padding: 10, fontSize: 15, borderRadius: 9 }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>
                            Quy tắc mở khóa (Unlock Type):
                        </label>
                        <select
                            className="form-control"
                            value={unlockType}
                            onChange={e => setUnlockType(e.target.value)}
                            style={{ marginTop: 5, padding: 10, borderRadius: 9 }}
                        >
                            <option value="NONE">Không yêu cầu (NONE)</option>
                            <option value="PREVIOUS_COMPLETED">
                                Phải hoàn thành bài ngay trước đó (PREVIOUS_COMPLETED)
                            </option>
                            <option value="SPECIFIC_LESSON_COMPLETED">
                                Phải hoàn thành bài cụ thể (SPECIFIC_LESSON_COMPLETED)
                            </option>
                        </select>
                    </div>

                    {unlockType === 'SPECIFIC_LESSON_COMPLETED' && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontWeight: 600, display: "block" }}>
                                Bài học yêu cầu hoàn thành trước (Required Lesson):
                            </label>
                            <select
                                className="form-control"
                                value={requiredLessonId}
                                onChange={e => setRequiredLessonId(e.target.value)}
                                style={{ marginTop: 5, padding: 10, borderRadius: 9 }}
                            >
                                <option value="">-- Chọn bài --</option>
                                {existingLessons.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: "#6c757d" }}>
                                Gợi ý: nên chọn bài đứng trước bài này trong lộ trình.
                            </small>
                        </div>
                    )}

                    {/* File tài liệu */}
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>Tài liệu bài học (tùy chọn):</label>
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ marginTop: 7 }}
                        />
                        {fileError && <div style={{ color: 'red', marginTop: 6, fontSize: 15 }}>{fileError}</div>}
                        <input
                            className="form-control mt-2"
                            placeholder="Tên tài liệu (hiển thị)"
                            value={resourceName}
                            onChange={e => setResourceName(e.target.value)}
                            style={{ marginTop: 8, padding: 10, borderRadius: 8 }}
                        />
                    </div>

                    <button className="btn btn-success"
                        type="submit"
                        style={{
                            width: "100%",
                            fontWeight: 700,
                            fontSize: 18,
                            padding: "11px 0",
                            borderRadius: 12,
                            boxShadow: "0 2px 13px #20e66122"
                        }}>
                        Thêm bài học
                    </button>
                </form>

                {success && <div style={{
                    color: "#1cb061", marginTop: 18, textAlign: "center", fontWeight: 600
                }}>{success}</div>}
                {error && <div style={{
                    color: "red", marginTop: 15, textAlign: "center", fontWeight: 600
                }}>{error}</div>}

                {/* Nút chuyển sang trang quản lý quiz */}
                {newLessonId &&
                    <div className="mt-4" style={{ textAlign: "center" }}>
                        <button
                            className="btn btn-primary"
                            style={{
                                fontWeight: 700,
                                borderRadius: 11,
                                fontSize: 16,
                                marginTop: 8,
                                boxShadow: "0 1px 12px #1677ff15"
                            }}
                            onClick={() => navigate(`/lessons/${newLessonId}/edit`)}
                        >
                            Thêm / Sửa câu hỏi trắc nghiệm cho bài học này
                        </button>
                    </div>
                }
            </div>
        </div>
    );
}

export default AddLessonPage;
