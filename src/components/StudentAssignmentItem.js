import React from "react";
import { useNavigate } from "react-router-dom";
import AssignmentStatusBadge from "./AssignmentStatusBadge";

function fmt(dt) {
    if (!dt) return "—";
    try {
        return new Date(dt).toLocaleString("vi-VN");
    } catch {
        return dt;
    }
}

export default function StudentAssignmentItem({ assignment, courseId }) {
    const navigate = useNavigate();

    const isNotSubmitted = assignment.status === "NOT_SUBMITTED";
    const isGraded = assignment.status === "GRADED";

    return (
        <div
            style={{
                border: "1px solid #e9ecef",
                borderRadius: 14,
                padding: "12px 14px",
                background: "#fff",
                boxShadow: "0 1px 10px #00000008",
            }}
        >
            <div className="d-flex justify-content-between align-items-start gap-3">
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>
                        {assignment.title || `Assignment ${assignment.assignmentId}`}
                    </div>

                    <div style={{ color: "#666", marginTop: 4, fontSize: 13 }}>
                        Hạn nộp: <b>{fmt(assignment.dueAt)}</b>
                        {assignment.maxScore != null ? (
                            <span style={{ marginLeft: 10 }}>
                                Max: <b>{assignment.maxScore}</b>
                            </span>
                        ) : null}
                    </div>
                </div>

                <AssignmentStatusBadge status={assignment.status} late={assignment.late} />
            </div>

            {(assignment.status === "SUBMITTED" || isGraded) && (
                <div style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
                    Đã nộp lúc: <b>{fmt(assignment.submittedAt)}</b>
                </div>
            )}

            {isGraded && (
                <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900, color: "#198754" }}>
                        Điểm: {assignment.score} / {assignment.maxScore ?? "—"}
                    </div>
                    <div style={{ marginTop: 6, color: "#444" }}>
                        <b>Feedback:</b> {assignment.feedback || "—"}
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-end gap-2" style={{ marginTop: 10 }}>
                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/courses/${courseId}/learn`)}
                >
                    Mở bài học
                </button>

                {isNotSubmitted && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            // Giai đoạn 1: điều hướng sang Learning để làm/submit
                            // Giai đoạn 2 (sau này): tạo page submit riêng /assignment/:id/submit
                            navigate(`/courses/${courseId}/learn`);
                        }}
                    >
                        Nộp bài
                    </button>
                )}
            </div>
        </div>
    );
}
