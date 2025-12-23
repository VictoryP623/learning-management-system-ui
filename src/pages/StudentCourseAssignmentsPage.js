import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentAssignmentTimeline } from "../services/api";
import RequireStudent from "../components/RequireStudent";
import StudentAssignmentLessonSection from "../components/StudentAssignmentLessonSection";

const StudentCourseAssignmentsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [timeline, setTimeline] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

    const token = useMemo(() => localStorage.getItem("accessToken"), []);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setErrMsg("");

                if (!token) {
                    setErrMsg("Bạn cần đăng nhập để xem assignments.");
                    return;
                }

                const res = await getStudentAssignmentTimeline(courseId, token);
                // BE bạn trả ResponseEntity<StudentAssignmentTimelineDto> => thường là res.data
                // Nếu bạn wrap theo {data: ...} thì sửa lại tương ứng
                setTimeline(res.data?.data || res.data);
            } catch (e) {
                const status = e?.response?.status;
                if (status === 403) setErrMsg("Bạn không có quyền truy cập (chỉ Student).");
                else if (status === 404) setErrMsg("Không tìm thấy dữ liệu hoặc bạn chưa enroll khóa học.");
                else setErrMsg("Có lỗi khi tải assignments.");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [courseId, token]);

    return (
        <RequireStudent>
            <div
                style={{
                    minHeight: "75vh",
                    background: "linear-gradient(110deg, #1677ff 0%, #49c6e5 100%)",
                    padding: "32px 0",
                }}
            >
                <div className="container">
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 18,
                            padding: 24,
                            boxShadow: "0 6px 30px #00306e22",
                        }}
                    >
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h2 style={{ margin: 0, fontWeight: 900, color: "#1677ff" }}>
                                    Assignment Timeline
                                </h2>
                                <div style={{ color: "#666", marginTop: 6 }}>
                                    Course ID: {courseId}
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate(-1)}
                                >
                                    Quay lại
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => navigate(`/courses/${courseId}/learn`)}
                                >
                                    Vào học
                                </button>
                            </div>
                        </div>

                        <hr />

                        {loading && <div>Đang tải assignments...</div>}
                        {!loading && errMsg && (
                            <div style={{ color: "crimson", fontWeight: 600 }}>{errMsg}</div>
                        )}

                        {!loading && !errMsg && !timeline && (
                            <div style={{ color: "#999" }}>Không có dữ liệu.</div>
                        )}

                        {!loading && !errMsg && timeline?.lessons?.length === 0 && (
                            <div style={{ color: "#999" }}>Khoá học chưa có assignment.</div>
                        )}

                        {!loading && !errMsg && timeline?.lessons?.length > 0 && (
                            <div>
                                {timeline.lessons.map((lesson) => (
                                    <StudentAssignmentLessonSection
                                        key={lesson.lessonId}
                                        lesson={lesson}
                                        courseId={courseId}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RequireStudent>
    );
};

export default StudentCourseAssignmentsPage;
