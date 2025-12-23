import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    TextField,
    Chip,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";

import {
    getLessonDetail,
    getAssignmentsByLesson,
    getAssignmentSubmissions,
    gradeAssignmentSubmission,
} from "../services/api";

import GradeSubmissionDialog from "../components/GradeSubmissionDialog";

function fmt(dt) {
    if (!dt) return "—";
    try {
        return new Date(dt).toLocaleString("vi-VN");
    } catch {
        return dt;
    }
}

export default function InstructorLessonGradingPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("accessToken"), []);

    const [searchParams, setSearchParams] = useSearchParams();
    const assignmentIdParam = searchParams.get("assignmentId");
    const submissionIdParam = searchParams.get("submissionId");

    const [lesson, setLesson] = useState(null);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    const [selectedAssignmentId, setSelectedAssignmentId] = useState(
        assignmentIdParam || ""
    );
    const selectedAssignment = useMemo(
        () => assignments.find((a) => String(a.id) === String(selectedAssignmentId)),
        [assignments, selectedAssignmentId]
    );

    const [submissions, setSubmissions] = useState([]);

    // Thesis-level: filter/search
    const [tab, setTab] = useState(0); // 0 all, 1 ungraded, 2 graded, 3 late
    const [q, setQ] = useState("");

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeSubmission, setActiveSubmission] = useState(null);

    // Snackbar
    const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
    const showToast = (type, msg) => setToast({ open: true, type, msg });

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                navigate("/login");
                return;
            }
            try {
                setLoading(true);
                const [lessonRes, assignmentsRes] = await Promise.all([
                    getLessonDetail(lessonId, token),
                    getAssignmentsByLesson(lessonId, token),
                ]);

                setLesson(lessonRes.data?.data || lessonRes.data);

                const list = assignmentsRes.data?.data || assignmentsRes.data || [];
                const safe = Array.isArray(list) ? list : [];
                setAssignments(safe);

                // auto-pick assignment
                if (!selectedAssignmentId && safe.length > 0) {
                    const firstId = String(safe[0].id);
                    setSelectedAssignmentId(firstId);
                    setSearchParams({ assignmentId: firstId });
                }
            } catch (e) {
                console.error(e);
                showToast("error", "Không tải được dữ liệu bài học hoặc bài tập.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonId, token]);

    const loadSubmissions = async (assignmentId) => {
        if (!assignmentId) {
            setSubmissions([]);
            return;
        }
        setLoadingSubmissions(true);
        try {
            const res = await getAssignmentSubmissions(assignmentId, token);
            const data = res.data?.data || res.data || [];
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            showToast("error", "Không tải được danh sách bài nộp.");
            setSubmissions([]);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    useEffect(() => {
        loadSubmissions(selectedAssignmentId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAssignmentId]);

    // If URL has submissionId, auto open dialog when loaded
    useEffect(() => {
        if (!submissionIdParam) return;
        const found = submissions.find((s) => String(s.id) === String(submissionIdParam));
        if (found) {
            setActiveSubmission(found);
            setDialogOpen(true);
        }
    }, [submissionIdParam, submissions]);

    // ✅ FIX ESLINT: make isLate stable and include in memo deps
    const isLate = useCallback(
        (sub) => {
            if (!sub?.submittedAt || !selectedAssignment?.dueAt) return false;
            return new Date(sub.submittedAt) > new Date(selectedAssignment.dueAt);
        },
        [selectedAssignment]
    );

    const filteredSubmissions = useMemo(() => {
        let list = Array.isArray(submissions) ? submissions : [];

        // search
        const kw = q.trim().toLowerCase();
        if (kw) {
            list = list.filter((s) => (s.studentName || "").toLowerCase().includes(kw));
        }

        // tabs
        if (tab === 1) list = list.filter((s) => s.score == null);
        if (tab === 2) list = list.filter((s) => s.score != null);
        if (tab === 3) list = list.filter((s) => isLate(s));

        // sort: ungraded first, then submittedAt desc
        list = [...list].sort((a, b) => {
            const ag = a.score != null ? 1 : 0;
            const bg = b.score != null ? 1 : 0;
            if (ag !== bg) return ag - bg;
            const at = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const bt = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return bt - at;
        });

        return list;
    }, [submissions, tab, q, isLate]);

    const handleSelectAssignment = (val) => {
        setSelectedAssignmentId(val);
        const next = {};
        if (val) next.assignmentId = String(val);
        setSearchParams(next);
    };

    const openDialog = (sub) => {
        setActiveSubmission(sub);
        setDialogOpen(true);
    };

    const handleSaveGrade = async ({ submissionId, score, feedback }) => {
        try {
            const payload = { submissionId, score, feedback };
            const res = await gradeAssignmentSubmission(payload, token);
            const updated = res.data?.data || res.data;

            // update list
            setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            showToast("success", "Lưu điểm thành công.");
        } catch (e) {
            console.error(e);
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Chấm điểm thất bại.";
            showToast("error", msg);
            throw new Error(msg);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!lesson) {
        return (
            <Box sx={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="error" fontWeight={800}>Không tìm thấy bài học.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "75vh", background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)", py: 5 }}>
            <Box sx={{ maxWidth: 1100, mx: "auto", px: 2 }}>
                <Paper sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: "0 8px 32px #00306e1a" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={900} sx={{ color: "#1566c2" }}>
                                Chấm bài – {lesson.name}
                            </Typography>
                            <Typography sx={{ color: "#666", fontWeight: 700 }}>
                                Lesson ID: {lessonId}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => navigate(`/instructor/lessons/${lessonId}/assignments`)}
                            >
                                Danh sách assignment
                            </Button>
                            <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
                                Quay lại
                            </Button>
                        </Stack>
                    </Stack>

                    {/* Assignment selector */}
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Chọn Assignment</InputLabel>
                            <Select
                                label="Chọn Assignment"
                                value={selectedAssignmentId}
                                onChange={(e) => handleSelectAssignment(e.target.value)}
                            >
                                {assignments.map((a) => (
                                    <MenuItem key={a.id} value={String(a.id)}>
                                        {a.title} {a.maxScore != null ? `(max ${a.maxScore})` : ""}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Tìm theo tên học viên"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </Stack>

                    {/* Due + stats */}
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        sx={{ mb: 1 }}
                    >
                        <Typography sx={{ color: "#666" }}>
                            Due: <b>{fmt(selectedAssignment?.dueAt)}</b> • Max score:{" "}
                            <b>{selectedAssignment?.maxScore ?? "—"}</b>
                        </Typography>

                        <Box sx={{ flex: 1 }} />

                        <Chip label={`Tổng: ${submissions.length}`} variant="outlined" sx={{ fontWeight: 800 }} />
                        <Chip
                            label={`Chưa chấm: ${submissions.filter((s) => s.score == null).length}`}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                        />
                        <Chip
                            label={`Đã chấm: ${submissions.filter((s) => s.score != null).length}`}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                        />
                    </Stack>

                    {/* Tabs */}
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
                        <Tab label="Tất cả" />
                        <Tab label="Chưa chấm" />
                        <Tab label="Đã chấm" />
                        <Tab label="Trễ hạn" />
                    </Tabs>

                    {/* Table */}
                    <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.5, background: "#fff" }}>
                        {loadingSubmissions ? (
                            <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : filteredSubmissions.length === 0 ? (
                            <Typography sx={{ color: "#888", py: 2 }}>
                                Không có submissions phù hợp.
                            </Typography>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 900 }}>Học viên</TableCell>
                                        <TableCell sx={{ fontWeight: 900 }}>Submitted</TableCell>
                                        <TableCell sx={{ fontWeight: 900 }}>Trễ hạn</TableCell>
                                        <TableCell sx={{ fontWeight: 900 }}>Điểm</TableCell>
                                        <TableCell sx={{ fontWeight: 900 }}>Feedback</TableCell>
                                        <TableCell sx={{ fontWeight: 900 }}>File/Text</TableCell>
                                        <TableCell sx={{ fontWeight: 900 }} align="right">
                                            Thao tác
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSubmissions.map((s) => {
                                        const graded = s.score != null;
                                        const late = isLate(s);
                                        return (
                                            <TableRow key={s.id} hover>
                                                <TableCell>{s.studentName || `Student #${s.studentId || "—"}`}</TableCell>
                                                <TableCell>{fmt(s.submittedAt)}</TableCell>
                                                <TableCell>
                                                    {late ? (
                                                        <Chip label="Trễ" color="warning" size="small" />
                                                    ) : (
                                                        <Chip label="Không" size="small" />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 900, color: graded ? "#198754" : "#6c757d" }}>
                                                    {graded
                                                        ? `${s.score} / ${selectedAssignment?.maxScore ?? "—"}`
                                                        : "Chưa chấm"}
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 260 }}>
                                                    <Tooltip title={s.feedback || ""}>
                                                        <span>
                                                            {s.feedback
                                                                ? (s.feedback.length > 50
                                                                    ? s.feedback.slice(0, 50) + "..."
                                                                    : s.feedback)
                                                                : "—"}
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 220 }}>
                                                    <Stack direction="row" spacing={1}>
                                                        {s.attachmentUrl ? (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => window.open(s.attachmentUrl, "_blank")}
                                                            >
                                                                File
                                                            </Button>
                                                        ) : null}
                                                        {s.textAnswer ? (
                                                            <Chip label="Text" size="small" />
                                                        ) : (
                                                            <Chip label="—" size="small" />
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant={graded ? "outlined" : "contained"}
                                                        onClick={() => openDialog(s)}
                                                    >
                                                        {graded ? "Sửa điểm" : "Chấm"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Paper>
            </Box>

            <GradeSubmissionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                submission={activeSubmission}
                assignment={selectedAssignment}
                onSave={handleSaveGrade}
            />

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setToast((t) => ({ ...t, open: false }))}
                    severity={toast.type}
                    variant="filled"
                    sx={{ fontWeight: 800 }}
                >
                    {toast.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
