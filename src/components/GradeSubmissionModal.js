import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function GradeSubmissionModal({
    show,
    onHide,
    submission,
    assignment, // để lấy maxScore
    onSubmitGrade, // async ({ submissionId, score, feedback })
}) {
    const maxScore = useMemo(() => assignment?.maxScore ?? null, [assignment]);

    const [score, setScore] = useState("");
    const [feedback, setFeedback] = useState("");
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!show) return;
        setErr("");
        setSaving(false);

        // prefill nếu đã chấm
        setScore(
            submission?.score === null || submission?.score === undefined
                ? ""
                : String(submission.score)
        );
        setFeedback(submission?.feedback || "");
    }, [show, submission]);

    const validate = () => {
        if (score === "" || score === null || score === undefined) {
            return "Vui lòng nhập điểm.";
        }
        const n = Number(score);
        if (Number.isNaN(n)) return "Điểm không hợp lệ.";
        if (n < 0) return "Điểm không được âm.";
        if (maxScore !== null && n > maxScore) return `Điểm không được vượt quá ${maxScore}.`;
        return "";
    };

    const handleSave = async () => {
        const msg = validate();
        if (msg) {
            setErr(msg);
            return;
        }
        setErr("");
        setSaving(true);
        try {
            await onSubmitGrade({
                submissionId: submission.id,
                score: Number(score),
                feedback: feedback?.trim() || "",
            });
            onHide();
        } catch (e) {
            setErr(e?.message || "Có lỗi khi lưu điểm.");
        } finally {
            setSaving(false);
        }
    };

    if (!submission) return null;

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chấm bài</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div style={{ fontSize: 14, color: "#555" }}>
                    <div><b>Submission ID:</b> {submission.id}</div>
                    <div><b>Học viên:</b> {submission.studentName || submission.student?.user?.fullname || "—"}</div>
                </div>

                <hr />

                <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                        Điểm {maxScore !== null ? `(tối đa ${maxScore})` : ""}
                    </label>
                    <input
                        className="form-control"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="Ví dụ: 8"
                    />
                </div>

                <div className="mb-2">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                        Feedback
                    </label>
                    <textarea
                        className="form-control"
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Nhận xét cho học viên..."
                    />
                </div>

                {err && <div style={{ color: "crimson", fontWeight: 600 }}>{err}</div>}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={saving}>
                    Hủy
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu điểm"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
