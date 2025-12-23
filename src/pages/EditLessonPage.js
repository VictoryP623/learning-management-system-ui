import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getLessonsByCourse } from "../services/api";
import QuizList from "../components/QuizList";
import AssignmentList from "../components/AssignmentList";

// ========= Helpers =========
function guessLabel(url = "", type = "") {
    if (type) return type;
    const lower = (url || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "PDF";
    if (/\.(jpg|jpeg|png|gif|webp)$/.test(lower)) return "IMAGE";
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "DOCX";
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "XLSX";
    if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "PPTX"; // ✅
    if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov")) return "VIDEO";
    return "FILE";
}

function isVideoFile(file) {
    if (!file) return false;
    const name = (file.name || "").toLowerCase();
    return name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".mov");
}

// validate attachments theo backend allowed (tài liệu + video attach)
function validateAttachment(file) {
    if (!file) return { valid: false, error: "File rỗng." };
    const name = (file.name || "").toLowerCase();
    const ok =
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".ppt") ||   // ✅
        name.endsWith(".pptx") ||  // ✅
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".gif") ||
        name.endsWith(".webp") ||
        name.endsWith(".mp4") ||
        name.endsWith(".webm") ||
        name.endsWith(".mov");

    if (!ok) {
        return { valid: false, error: "Không hỗ trợ định dạng file này (pdf/docx/xlsx/pptx/image/video)." };
    }
    return { valid: true, error: "" };
}

// parse PageDto data array (chịu mọi kiểu wrapper)
function parsePageDtoItems(res) {
    const data = res?.data;

    if (data && Array.isArray(data.data)) return data.data;
    if (data?.data && Array.isArray(data.data.data)) return data.data.data;
    if (Array.isArray(data?.content)) return data.content;

    return [];
}

export default function EditLessonPage() {
    const { id } = useParams(); // lessonId
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const [lesson, setLesson] = useState(null);
    const [existingLessons, setExistingLessons] = useState([]);

    // Video main
    const [videoFile, setVideoFile] = useState(null);
    const [videoError, setVideoError] = useState("");
    const videoInputRef = useRef(null);

    // Resources list
    const [resources, setResources] = useState([]); // [{id,name,url,type,orderIndex}]
    const [loadingResources, setLoadingResources] = useState(false);

    // Add new attachments (multiple)
    const [newFiles, setNewFiles] = useState([]); // [{file, displayName, error}]
    const newFilesInputRef = useRef(null);

    // Replace one attachment
    const replaceInputRefs = useRef({}); // { [resourceId]: inputRef }

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ===== Fetch lesson + resources =====
    const fetchLesson = async () => {
        setError("");
        try {
            const res = await axios.get(`http://localhost:8081/api/lessons/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const dto = res.data?.data || res.data;
            setLesson(dto);
        } catch (e) {
            console.error(e);
            setError("Không lấy được thông tin bài học!");
        }
    };

    const fetchResources = async () => {
        setLoadingResources(true);
        try {
            const res = await axios.get(`http://localhost:8081/api/lesson-resources`, {
                params: { lessonId: id, page: 0, limit: 200 },
                headers: { Authorization: `Bearer ${token}` },
            });
            const list = parsePageDtoItems(res);
            setResources(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error(e);
            setResources([]);
        } finally {
            setLoadingResources(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchLesson();
        fetchResources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // fetch existing lessons for unlock rule
    useEffect(() => {
        const run = async () => {
            try {
                if (!lesson?.courseId) return;
                const res = await getLessonsByCourse(lesson.courseId, token);
                const list = Array.isArray(res.data) ? res.data : [];
                setExistingLessons(list.filter((l) => String(l.id) !== String(id)));
            } catch {
                setExistingLessons([]);
            }
        };
        run();
    }, [lesson?.courseId, id, token]);

    // ===== Handlers: lesson fields =====
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLesson((prev) => ({
            ...(prev || {}),
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ===== Video main handlers =====
    const onPickVideo = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!isVideoFile(f)) {
            setVideoError("Chỉ hỗ trợ video .mp4/.webm/.mov");
            setVideoFile(null);
            if (videoInputRef.current) videoInputRef.current.value = "";
            return;
        }
        setVideoError("");
        setVideoFile(f);
    };

    const uploadOrReplaceVideo = async () => {
        setError("");
        setSuccess("");

        if (!videoFile) {
            setError("Bạn chưa chọn file video.");
            return;
        }
        if (videoError) return;

        try {
            const form = new FormData();
            form.append("file", videoFile);

            await axios.post(`http://localhost:8081/api/lessons/${id}/video`, form, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 0,
            });

            setSuccess("Đã upload/thay thế video chính!");
            setVideoFile(null);
            if (videoInputRef.current) videoInputRef.current.value = "";

            await fetchLesson();
        } catch (e) {
            console.error(e);
            setError("Upload video thất bại!");
        }
    };

    const deleteVideo = async () => {
        setError("");
        setSuccess("");
        try {
            await axios.delete(`http://localhost:8081/api/lessons/${id}/video`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess("Đã xóa video chính!");
            await fetchLesson();
        } catch (e) {
            console.error(e);
            setError("Xóa video thất bại!");
        }
    };

    // ===== Attachments add/replace/delete =====
    const onPickNewFiles = (e) => {
        const picked = Array.from(e.target.files || []);
        if (!picked.length) return;

        const mapped = picked.map((f) => {
            const v = validateAttachment(f);
            return { file: v.valid ? f : null, displayName: f.name, error: v.valid ? "" : v.error };
        });
        setNewFiles(mapped);
    };

    const updateNewFileName = (idx, value) => {
        setNewFiles((prev) => prev.map((x, i) => (i === idx ? { ...x, displayName: value } : x)));
    };

    const removeNewFile = (idx) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const uploadOneResource = async (file, resourceName) => {
        const form = new FormData();
        form.append("file", file);
        form.append("resourceName", resourceName || file.name);

        // ✅ IMPORTANT: KHÔNG set Content-Type, axios tự set boundary
        await axios.post(`http://localhost:8081/api/lesson-resources`, form, {
            params: { lessonId: id },
            headers: { Authorization: `Bearer ${token}` },
        });
    };

    const uploadNewAttachments = async () => {
        setError("");
        setSuccess("");

        const validItems = newFiles.filter((x) => x.file && !x.error);
        if (!validItems.length) {
            setError("Chưa có file hợp lệ để upload.");
            return;
        }

        try {
            for (const item of validItems) {
                await uploadOneResource(item.file, item.displayName);
            }
            setSuccess("Đã upload tài liệu đính kèm!");
            setNewFiles([]);
            if (newFilesInputRef.current) newFilesInputRef.current.value = "";
            await fetchResources();
        } catch (e) {
            console.error(e);
            setError("Upload tài liệu thất bại!");
        }
    };

    const deleteResource = async (resourceId) => {
        setError("");
        setSuccess("");
        try {
            await axios.delete(`http://localhost:8081/api/lesson-resources/${resourceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess("Đã xóa tài liệu!");
            await fetchResources();
        } catch (e) {
            console.error(e);
            setError("Xóa tài liệu thất bại!");
        }
    };

    // Replace theo Model A: giữ nguyên resourceName => backend replace + xóa cũ
    const triggerPickReplace = (rid) => {
        const ref = replaceInputRefs.current[rid];
        if (ref) ref.click();
    };

    const onPickReplaceFile = async (resource, e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        const v = validateAttachment(f);
        if (!v.valid) {
            setError(v.error);
            e.target.value = "";
            return;
        }

        setError("");
        setSuccess("");

        try {
            await uploadOneResource(f, resource.name);
            setSuccess(`Đã thay thế: ${resource.name}`);
            e.target.value = "";
            await fetchResources();
        } catch (err) {
            console.error(err);
            setError("Replace file thất bại!");
        }
    };

    // ===== Update lesson info (text fields) =====
    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        setError("");
        setSuccess("");

        if (!lesson) return;

        if (lesson.unlockType === "SPECIFIC_LESSON_COMPLETED" && !lesson.requiredLessonId) {
            setError("Hãy chọn bài học yêu cầu hoàn thành trước (Required Lesson).");
            return;
        }

        try {
            const payload = {
                name: lesson.name,
                description: lesson.description,
                courseId: lesson.courseId,
                isFree: lesson.isFree,
                durationSec: lesson.durationSec ? Number(lesson.durationSec) : null,
                unlockType: lesson.unlockType || "NONE",
                requiredLessonId:
                    lesson.unlockType === "SPECIFIC_LESSON_COMPLETED" && lesson.requiredLessonId
                        ? Number(lesson.requiredLessonId)
                        : null,
            };

            await axios.patch(`http://localhost:8081/api/lessons/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess("Đã cập nhật thông tin bài học!");
            setTimeout(() => navigate(`/instructor/course/${lesson.courseId}`), 900);
        } catch (err) {
            console.error(err);
            setError("Cập nhật thất bại!");
        }
    };

    if (!lesson) {
        return (
            <div
                style={{
                    minHeight: "75vh",
                    background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 22,
                }}
            >
                Đang tải...
            </div>
        );
    }

    const currentVideoUrl = lesson.videoUrl || lesson.resourceUrl || "";

    return (
        <div
            style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                padding: "50px 0",
            }}
        >
            <div
                style={{
                    maxWidth: 900,
                    margin: "0 auto",
                    padding: "38px 32px 32px 32px",
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 8px 32px #1677ff16",
                }}
            >
                <h2 style={{ textAlign: "center", fontWeight: 900, marginBottom: 18, color: "#1566c2" }}>
                    Sửa bài học
                </h2>

                {/* ========== FORM INFO ========== */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 700, marginBottom: 6, display: "block" }}>
                            Tiêu đề bài học:
                        </label>
                        <input
                            className="form-control"
                            name="name"
                            value={lesson.name || ""}
                            onChange={handleChange}
                            required
                            style={{ padding: 10, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập tiêu đề bài học"
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 700, marginBottom: 6, display: "block" }}>
                            Nội dung:
                        </label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={lesson.description || ""}
                            onChange={handleChange}
                            required
                            rows={5}
                            style={{ padding: 10, fontSize: 16, borderRadius: 9 }}
                            placeholder="Nhập nội dung bài học"
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 700, display: "block" }}>
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
                        <label style={{ fontWeight: 700, marginBottom: 6, display: "block" }}>
                            Thời lượng bài học (giây):
                        </label>
                        <input
                            type="number"
                            name="durationSec"
                            min={0}
                            className="form-control"
                            value={lesson.durationSec || ""}
                            onChange={handleChange}
                            placeholder="VD: 600 (10 phút)"
                            style={{ padding: 10, fontSize: 15, borderRadius: 9 }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 700, marginBottom: 6, display: "block" }}>
                            Quy tắc mở khóa (Unlock Type):
                        </label>
                        <select
                            name="unlockType"
                            className="form-control"
                            value={lesson.unlockType || "NONE"}
                            onChange={handleChange}
                            style={{ padding: 10, borderRadius: 9 }}
                        >
                            <option value="NONE">Không yêu cầu (NONE)</option>
                            <option value="PREVIOUS_COMPLETED">Phải hoàn thành bài ngay trước đó</option>
                            <option value="SPECIFIC_LESSON_COMPLETED">Phải hoàn thành bài cụ thể</option>
                        </select>
                    </div>

                    {lesson.unlockType === "SPECIFIC_LESSON_COMPLETED" && (
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 700, marginBottom: 6, display: "block" }}>
                                Bài học yêu cầu hoàn thành trước:
                            </label>
                            <select
                                name="requiredLessonId"
                                className="form-control"
                                value={lesson.requiredLessonId || ""}
                                onChange={handleChange}
                                style={{ padding: 10, borderRadius: 9 }}
                            >
                                <option value="">-- Chọn bài --</option>
                                {existingLessons.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </form>

                {/* ========== VIDEO MAIN ========== */}
                <div style={{ marginTop: 22, padding: 16, borderRadius: 12, background: "#f7fbff" }}>
                    <div style={{ fontWeight: 900, color: "#1566c2", marginBottom: 10, fontSize: 16 }}>
                        Video chính của bài học
                    </div>

                    {currentVideoUrl ? (
                        <div style={{ marginBottom: 10 }}>
                            <video
                                src={currentVideoUrl}
                                controls
                                style={{
                                    width: "100%",
                                    maxWidth: 760,
                                    borderRadius: 12,
                                    boxShadow: "0 2px 18px #1677ff15",
                                }}
                            />
                            <div style={{ marginTop: 8 }}>
                                <a
                                    href={currentVideoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontWeight: 800, color: "#1677ff" }}
                                >
                                    Mở video ở tab mới
                                </a>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                style={{ marginTop: 10, fontWeight: 800, borderRadius: 10 }}
                                onClick={deleteVideo}
                            >
                                Xóa video chính
                            </button>
                        </div>
                    ) : (
                        <div style={{ color: "#6c757d", fontWeight: 700, marginBottom: 10 }}>
                            Chưa có video chính.
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            className="form-control"
                            onChange={onPickVideo}
                            ref={videoInputRef}
                            style={{ maxWidth: 420 }}
                        />
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={uploadOrReplaceVideo}
                            style={{ fontWeight: 900, borderRadius: 10 }}
                            disabled={!videoFile || !!videoError}
                        >
                            {currentVideoUrl ? "Thay thế video" : "Upload video"}
                        </button>
                    </div>

                    {videoError && <div style={{ color: "red", marginTop: 8, fontWeight: 800 }}>{videoError}</div>}
                    {videoFile && !videoError && (
                        <div style={{ color: "#6c757d", marginTop: 6 }}>Đã chọn: {videoFile.name}</div>
                    )}
                </div>

                {/* ========== ATTACHMENTS LIST ========== */}
                <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: "#f7fbff" }}>
                    <div style={{ fontWeight: 900, color: "#1566c2", marginBottom: 10, fontSize: 16 }}>
                        Tài liệu đính kèm (nhiều file)
                    </div>

                    {loadingResources ? (
                        <div style={{ fontWeight: 800, color: "#6c757d" }}>Đang tải tài liệu...</div>
                    ) : resources.length === 0 ? (
                        <div style={{ fontWeight: 700, color: "#6c757d" }}>Chưa có tài liệu đính kèm.</div>
                    ) : (
                        <div>
                            {resources.map((r) => (
                                <div
                                    key={r.id}
                                    style={{
                                        background: "#fff",
                                        borderRadius: 12,
                                        padding: "10px 12px",
                                        marginBottom: 10,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, color: "#1f2a37" }}>
                                            {r.name || "Tài liệu"}{" "}
                                            <span style={{ fontWeight: 900, color: "#1677ff", marginLeft: 8 }}>
                                                [{guessLabel(r.url, r.type)}]
                                            </span>
                                        </div>
                                        <a
                                            href={r.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "#1677ff", fontWeight: 800 }}
                                        >
                                            Mở / Tải xuống
                                        </a>
                                    </div>

                                    <input
                                        type="file"
                                        style={{ display: "none" }}
                                        ref={(el) => (replaceInputRefs.current[r.id] = el)}
                                        onChange={(e) => onPickReplaceFile(r, e)}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
                                    />

                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            style={{ fontWeight: 900, borderRadius: 10 }}
                                            onClick={() => triggerPickReplace(r.id)}
                                        >
                                            Thay thế
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            style={{ fontWeight: 900, borderRadius: 10 }}
                                            onClick={() => deleteResource(r.id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ADD NEW MULTIPLE */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed #cfe3ff" }}>
                        <div style={{ fontWeight: 900, marginBottom: 10 }}>Thêm tài liệu mới</div>
                        <input
                            type="file"
                            multiple
                            className="form-control"
                            onChange={onPickNewFiles}
                            ref={newFilesInputRef}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
                        />

                        {newFiles.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                {newFiles.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: "flex",
                                            gap: 10,
                                            alignItems: "center",
                                            marginBottom: 10,
                                            background: "#fff",
                                            borderRadius: 12,
                                            padding: 10,
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 900 }}>
                                                {item.file ? item.file.name : "(file lỗi)"}
                                            </div>
                                            {item.error && <div style={{ color: "red", fontWeight: 800 }}>{item.error}</div>}
                                            <input
                                                className="form-control"
                                                value={item.displayName}
                                                onChange={(e) => updateNewFileName(idx, e.target.value)}
                                                placeholder="Tên hiển thị (resourceName)"
                                                style={{ marginTop: 6, borderRadius: 10 }}
                                                disabled={!!item.error}
                                            />
                                            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 4 }}>
                                                Tip: nếu đặt trùng tên với file đã có → backend sẽ REPLACE theo Model A.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => removeNewFile(idx)}
                                            style={{ borderRadius: 10, fontWeight: 900, height: 36 }}
                                        >
                                            Bỏ
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="btn btn-success"
                                    style={{ fontWeight: 900, borderRadius: 12, width: "100%" }}
                                    onClick={uploadNewAttachments}
                                >
                                    Upload tài liệu
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========== Assignment / Quiz management ========== */}
                <div style={{ marginTop: 26 }}>
                    <AssignmentList lessonId={id} isEditing={true} />
                </div>

                <div style={{ marginTop: 26 }}>
                    <QuizList lessonId={id} isEditing={true} />
                </div>

                {/* ========== Submit + messages ========== */}
                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleSubmit}
                    style={{
                        width: "100%",
                        fontWeight: 900,
                        padding: "11px 0",
                        borderRadius: 12,
                        fontSize: 18,
                        marginTop: 26,
                        boxShadow: "0 2px 13px #1677ff22",
                    }}
                >
                    Cập nhật thông tin bài học
                </button>

                {success && (
                    <div style={{ color: "#1cb061", marginTop: 14, textAlign: "center", fontWeight: 900 }}>
                        {success}
                    </div>
                )}
                {error && (
                    <div style={{ color: "red", marginTop: 12, textAlign: "center", fontWeight: 900 }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
