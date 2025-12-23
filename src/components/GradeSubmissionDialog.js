import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Divider,
    Chip,
    Stack,
} from "@mui/material";

export default function GradeSubmissionDialog({
    open,
    onClose,
    submission,
    assignment,
    onSave, // async ({ submissionId, score, feedback })
}) {
    const maxScore = useMemo(() => assignment?.maxScore ?? null, [assignment]);

    const [score, setScore] = useState("");
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError("");
        setSaving(false);

        // prefill nếu đã chấm
        setScore(
            submission?.score === null || submission?.score === undefined
                ? ""
                : String(submission.score)
        );
        setFeedback(submission?.feedback || "");
    }, [open, submission]);

    const validate = () => {
        const raw = String(score ?? "").trim();

        if (!raw) return "Vui lòng nhập điểm.";

        // DTO score là Integer -> chỉ cho số nguyên không âm
        if (!/^\d+$/.test(raw)) return "Điểm phải là số nguyên không âm.";

        const n = parseInt(raw, 10);
        if (Number.isNaN(n)) return "Điểm không hợp lệ.";
        if (n < 0) return "Điểm không được âm.";

        if (maxScore !== null && n > maxScore) {
            return `Điểm không được vượt quá ${maxScore}.`;
        }

        return "";
    };

    const handleSave = async () => {
        if (!submission?.id) return;

        const msg = validate();
        if (msg) {
            setError(msg);
            return;
        }

        setError("");
        setSaving(true);

        try {
            const n = parseInt(String(score).trim(), 10);

            await onSave({
                submissionId: submission.id,
                score: n, // Integer
                feedback: feedback?.trim() ? feedback.trim() : null,
            });

            onClose();
        } catch (e) {
            setError(e?.message || "Có lỗi khi lưu điểm.");
        } finally {
            setSaving(false);
        }
    };

    if (!submission) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 900 }}>Chấm điểm</DialogTitle>

            <DialogContent>
                <Stack spacing={0.5} sx={{ color: "#666" }}>
                    <Typography variant="body2">
                        <b>Học viên:</b>{" "}
                        {submission.studentName || `Student #${submission.studentId || "—"}`}
                    </Typography>
                    <Typography variant="body2">
                        <b>Submitted:</b>{" "}
                        {submission.submittedAt
                            ? new Date(submission.submittedAt).toLocaleString("vi-VN")
                            : "—"}
                    </Typography>
                    {submission.gradedAt ? (
                        <Typography variant="body2">
                            <b>Graded:</b>{" "}
                            {new Date(submission.gradedAt).toLocaleString("vi-VN")}
                        </Typography>
                    ) : null}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {(submission.textAnswer || submission.attachmentUrl) && (
                    <>
                        {submission.textAnswer ? (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <b>Text answer:</b> {submission.textAnswer}
                            </Typography>
                        ) : null}

                        {submission.attachmentUrl ? (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <b>Attachment:</b>{" "}
                                <a
                                    href={submission.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Mở file
                                </a>
                            </Typography>
                        ) : null}

                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {maxScore !== null ? (
                        <Chip
                            label={`Max score: ${maxScore}`}
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 800 }}
                        />
                    ) : null}
                </Stack>

                <TextField
                    label={maxScore != null ? `Điểm (tối đa ${maxScore})` : "Điểm"}
                    type="number"
                    fullWidth
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    inputProps={{
                        min: 0,
                        step: 1, // gợi ý số nguyên
                    }}
                    sx={{ mb: 2 }}
                />

                <TextField
                    label="Feedback"
                    fullWidth
                    multiline
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />

                {error ? (
                    <Typography sx={{ color: "crimson", mt: 1, fontWeight: 800 }}>
                        {error}
                    </Typography>
                ) : null}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={saving} color="inherit">
                    Hủy
                </Button>
                <Button onClick={handleSave} disabled={saving} variant="contained">
                    {saving ? "Đang lưu..." : "Lưu điểm"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
