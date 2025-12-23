import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Collapse,
    Chip,
    Stack,
} from "@mui/material";

import { getLessonDetail, getAssignmentsByLesson, getAssignmentSubmissions } from "../services/api";

export default function InstructorLessonAssignmentsPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const [lesson, setLesson] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});
    const [loadingSubmissionsFor, setLoadingSubmissionsFor] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!lessonId || !token) {
                setError("Thiếu thông tin bài học hoặc chưa đăng nhập.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [lessonRes, assignmentRes] = await Promise.all([
                    getLessonDetail(lessonId, token),
                    getAssignmentsByLesson(lessonId, token),
                ]);

                const lessonData = lessonRes.data?.data || lessonRes.data;
                const assignData = assignmentRes.data?.data || assignmentRes.data || [];

                setLesson(lessonData);
                setAssignments(Array.isArray(assignData) ? assignData : []);
            } catch (e) {
                console.error(e);
                setError("Không tải được thông tin bài học hoặc danh sách bài tập.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lessonId, token]);

    const handleToggleSubmissions = async (assignmentId) => {
        // nếu đã load rồi thì toggle đóng/mở ngay
        if (submissionsByAssignment[assignmentId]) {
            setSubmissionsByAssignment((prev) => {
                const next = { ...prev };
                // set null để collapse đóng; hoặc giữ list và dùng thêm state opened
                next[assignmentId] = null;
                return next;
            });
            return;
        }

        setLoadingSubmissionsFor(assignmentId);
        try {
            const res = await getAssignmentSubmissions(assignmentId, token);
            const list = res.data?.data || res.data || [];
            setSubmissionsByAssignment((prev) => ({
                ...prev,
                [assignmentId]: Array.isArray(list) ? list : [],
            }));
        } catch (e) {
            console.error(e);
            setError("Không tải được danh sách bài nộp.");
        } finally {
            setLoadingSubmissionsFor(null);
        }
    };

    const handleGradeClick = (assignmentId, submissionId) => {
        navigate(`/instructor/lessons/${lessonId}/grading?assignmentId=${assignmentId}&submissionId=${submissionId}`);
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="error" fontWeight={700}>{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "75vh", background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)", py: 5 }}>
            <Box sx={{ maxWidth: 980, mx: "auto", px: 2 }}>
                <Paper sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, boxShadow: "0 8px 32px #00306e1a" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={900} sx={{ color: "#1566c2" }}>
                                Bài tập của bài học
                            </Typography>
                            <Typography sx={{ color: "#546e7a", fontWeight: 700 }}>
                                {lesson?.name}
                            </Typography>
                        </Box>

                        <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
                            Quay lại
                        </Button>
                    </Stack>

                    {assignments.length === 0 ? (
                        <Typography sx={{ color: "#888", textAlign: "center", py: 2 }}>
                            Chưa có bài tập nào cho bài học này.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {assignments.map((a) => {
                                const submissions = submissionsByAssignment[a.id];
                                const opened = Array.isArray(submissions);
                                const isLoadingSub = loadingSubmissionsFor === a.id;

                                return (
                                    <Paper key={a.id} variant="outlined" sx={{ borderRadius: 3, p: 2, background: "#f8fbff" }}>
                                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
                                            <Box>
                                                <Typography fontWeight={900} sx={{ color: "#263b50" }}>
                                                    {a.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#757575", mt: 0.5 }}>
                                                    Hạn nộp: {a.dueAt ? new Date(a.dueAt).toLocaleString("vi-VN") : "Không có hạn nộp"} • Max: {a.maxScore ?? "—"}
                                                </Typography>
                                            </Box>

                                            <Button
                                                variant="outlined"
                                                onClick={() => handleToggleSubmissions(a.id)}
                                                disabled={isLoadingSub}
                                            >
                                                {isLoadingSub ? "Đang tải..." : opened ? "Ẩn bài nộp" : "Xem bài nộp"}
                                            </Button>
                                        </Stack>

                                        <Collapse in={opened} timeout="auto" unmountOnExit>
                                            <Box sx={{ mt: 2 }}>
                                                {opened && submissions.length === 0 ? (
                                                    <Typography sx={{ color: "#999" }}>Chưa có học viên nào nộp bài.</Typography>
                                                ) : (
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
                                                                <TableCell sx={{ fontWeight: 800 }}>Đã nộp lúc</TableCell>
                                                                <TableCell sx={{ fontWeight: 800 }}>Điểm</TableCell>
                                                                <TableCell sx={{ fontWeight: 800 }} align="right">Thao tác</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {submissions?.map((sub) => {
                                                                const graded = sub.score != null;
                                                                return (
                                                                    <TableRow key={sub.id}>
                                                                        <TableCell>{sub.studentName}</TableCell>
                                                                        <TableCell>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("vi-VN") : "—"}</TableCell>
                                                                        <TableCell>
                                                                            {graded ? (
                                                                                <Chip label={`${sub.score}`} color="success" size="small" />
                                                                            ) : (
                                                                                <Chip label="Chưa chấm" color="default" size="small" />
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            <Button
                                                                                size="small"
                                                                                variant="contained"
                                                                                onClick={() => handleGradeClick(a.id, sub.id)}
                                                                            >
                                                                                {graded ? "Chấm lại" : "Chấm điểm"}
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}
