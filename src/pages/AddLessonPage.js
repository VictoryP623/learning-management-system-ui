import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateFileType, getLessonsByCourse } from '../services/api';

const RAW_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const API_URL = RAW_BASE ? `${RAW_BASE}/api` : "http://localhost:8081/api";

function AddLessonPage() {
    const { id } = useParams(); // courseId
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isFree, setIsFree] = useState(false);

    const [durationSec, setDurationSec] = useState('');
    const [unlockType, setUnlockType] = useState('NONE');
    const [requiredLessonId, setRequiredLessonId] = useState('');
    const [existingLessons, setExistingLessons] = useState([]);

    // VIDEO MAIN (single)
    const [videoFile, setVideoFile] = useState(null);
    const [videoError, setVideoError] = useState('');
    const videoInputRef = useRef(null);

    // ATTACHMENTS (multiple)
    const [files, setFiles] = useState([]); // [{file, displayName, error}]
    const filesInputRef = useRef(null);

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [newLessonId, setNewLessonId] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                if (!token) return;
                const res = await getLessonsByCourse(id, token);
                setExistingLessons(Array.isArray(res.data) ? res.data : []);
            } catch {
                setExistingLessons([]);
            }
        };
        if (id) fetchLessons();
    }, [id, token]);

    const handleVideoChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        const lower = (f.name || '').toLowerCase();
        const ok = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
        if (!ok) {
            setVideoError('Chỉ hỗ trợ video .mp4/.webm/.mov');
            setVideoFile(null);
            if (videoInputRef.current) videoInputRef.current.value = '';
            return;
        }
        setVideoError('');
        setVideoFile(f);
    };

    const handleFilesChange = (e) => {
        const picked = Array.from(e.target.files || []);
        if (!picked.length) return;

        const mapped = picked.map((f) => {
            const v = validateFileType(f);
            return { file: v.valid ? f : null, displayName: f.name, error: v.valid ? '' : v.error };
        });
        setFiles(mapped);
    };

    const updateFileName = (idx, value) => {
        setFiles((prev) => prev.map((x, i) => (i === idx ? { ...x, displayName: value } : x)));
    };

    const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

    const uploadMainVideo = async (lessonId) => {
        if (!videoFile) return;

        const formData = new FormData();
        formData.append("file", videoFile);

        await axios.post(`${API_URL}/lessons/${lessonId}/video`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 0,
        });
    };

    const uploadOneResource = async (lessonId, file, displayName) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('resourceName', displayName || file.name);

        // ✅ IMPORTANT: KHÔNG set Content-Type
        await axios.post(`${API_URL}/lesson-resources`, formData, {
            params: { lessonId },
            headers: { Authorization: `Bearer ${token}` },
        });
    };

    const uploadAllResources = async (lessonId) => {
        const validItems = files.filter((x) => x.file && !x.error);
        for (const item of validItems) {
            await uploadOneResource(lessonId, item.file, item.displayName);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (unlockType === 'SPECIFIC_LESSON_COMPLETED' && !requiredLessonId) {
            setError('Hãy chọn bài học cần hoàn thành trước (Required Lesson).');
            return;
        }
        if (videoError) return;

        const payload = {
            name,
            description,
            courseId: id,
            isFree,
            resourceUrl: null,
            durationSec: durationSec ? Number(durationSec) : null,
            unlockType,
            requiredLessonId:
                unlockType === 'SPECIFIC_LESSON_COMPLETED' && requiredLessonId
                    ? Number(requiredLessonId)
                    : null
        };

        try {
            const res = await axios.post(`${API_URL}/lessons`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const lessonId = res.data?.data?.id || res.data?.id;
            setNewLessonId(lessonId);

            if (lessonId) {
                if (videoFile) await uploadMainVideo(lessonId);
                if (files.length) await uploadAllResources(lessonId);
            }

            setSuccess('Thêm bài học thành công!');
            setError('');

            setVideoFile(null);
            if (videoInputRef.current) videoInputRef.current.value = '';
            setFiles([]);
            if (filesInputRef.current) filesInputRef.current.value = '';
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
                maxWidth: 760,
                margin: "0 auto",
                background: "#fff",
                padding: "38px 30px 32px 30px",
                borderRadius: 18,
                boxShadow: "0 8px 32px #1677ff22"
            }}>
                <h2 style={{ textAlign: "center", fontWeight: 800, color: "#1566c2", marginBottom: 26 }}>
                    Thêm bài học mới
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>Tiêu đề bài học:</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} required
                            style={{ marginTop: 5, padding: 11, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập tiêu đề bài học" />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>Nội dung:</label>
                        <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} required
                            rows={5} style={{ marginTop: 5, padding: 11, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập nội dung bài học" />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600 }}>
                            <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} style={{ marginRight: 10 }} />
                            Miễn phí xem trước
                        </label>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>
                            Thời lượng bài học (giây):
                        </label>
                        <input type="number" min={0} className="form-control"
                            value={durationSec} onChange={e => setDurationSec(e.target.value)}
                            placeholder="VD: 600 (10 phút)"
                            style={{ marginTop: 5, padding: 10, fontSize: 15, borderRadius: 9 }} />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, display: "block" }}>
                            Quy tắc mở khóa (Unlock Type):
                        </label>
                        <select className="form-control" value={unlockType} onChange={e => setUnlockType(e.target.value)}
                            style={{ marginTop: 5, padding: 10, borderRadius: 9 }}>
                            <option value="NONE">Không yêu cầu (NONE)</option>
                            <option value="PREVIOUS_COMPLETED">Phải hoàn thành bài ngay trước đó</option>
                            <option value="SPECIFIC_LESSON_COMPLETED">Phải hoàn thành bài cụ thể</option>
                        </select>
                    </div>

                    {unlockType === 'SPECIFIC_LESSON_COMPLETED' && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontWeight: 600, display: "block" }}>
                                Bài học yêu cầu hoàn thành trước:
                            </label>
                            <select className="form-control" value={requiredLessonId} onChange={e => setRequiredLessonId(e.target.value)}
                                style={{ marginTop: 5, padding: 10, borderRadius: 9 }}>
                                <option value="">-- Chọn bài --</option>
                                {existingLessons.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* VIDEO MAIN */}
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 800, display: "block", color: "#1566c2" }}>
                            Video chính của bài học (1 file)
                        </label>
                        <input type="file" accept="video/mp4,video/webm,video/quicktime"
                            className="form-control"
                            onChange={handleVideoChange}
                            ref={videoInputRef}
                            style={{ marginTop: 10 }} />
                        {videoError && <div style={{ color: 'red', marginTop: 6, fontWeight: 700 }}>{videoError}</div>}
                        {videoFile && <div style={{ color: '#6c757d', marginTop: 6 }}>Đã chọn: {videoFile.name}</div>}
                    </div>

                    {/* ATTACHMENTS */}
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 800, display: "block", color: "#1566c2" }}>
                            Tài liệu đính kèm (nhiều file)
                        </label>

                        <input
                            type="file"
                            multiple
                            className="form-control"
                            onChange={handleFilesChange}
                            ref={filesInputRef}
                            style={{ marginTop: 10 }}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
                        />

                        {files.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                {files.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800 }}>{item.file ? item.file.name : '(file lỗi)'}</div>
                                            {item.error && <div style={{ color: 'red', fontSize: 13 }}>{item.error}</div>}
                                            <input className="form-control" value={item.displayName}
                                                onChange={(e) => updateFileName(idx, e.target.value)}
                                                placeholder="Tên hiển thị (resourceName)"
                                                style={{ marginTop: 6, borderRadius: 10 }}
                                                disabled={!!item.error} />
                                        </div>
                                        <button type="button" className="btn btn-outline-secondary btn-sm"
                                            onClick={() => removeFile(idx)}
                                            style={{ borderRadius: 10, fontWeight: 800, height: 36 }}>
                                            Bỏ
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="btn btn-success" type="submit"
                        style={{ width: "100%", fontWeight: 800, fontSize: 18, padding: "11px 0", borderRadius: 12 }}>
                        Thêm bài học
                    </button>
                </form>

                {success && <div style={{ color: "#1cb061", marginTop: 18, textAlign: "center", fontWeight: 800 }}>{success}</div>}
                {error && <div style={{ color: "red", marginTop: 15, textAlign: "center", fontWeight: 800 }}>{error}</div>}

                {newLessonId && (
                    <div style={{ textAlign: "center", marginTop: 14 }}>
                        <button className="btn btn-primary"
                            style={{ fontWeight: 800, borderRadius: 11, fontSize: 16 }}
                            onClick={() => navigate(`/lessons/${newLessonId}/edit`)}>
                            Mở trang sửa bài học
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddLessonPage;
