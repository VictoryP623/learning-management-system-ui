import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from '@mui/material';
import {
    getAssignmentsByLesson,
    getAssignmentSubmissions,
    gradeAssignmentSubmission
} from '../services/api';

function InstructorAssignments({ lessonId }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Dialog danh sách bài nộp
    const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState('');

    // Dialog chấm điểm 1 bài
    const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [grading, setGrading] = useState(false);

    // Dialog thông báo chung
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyMsg, setNotifyMsg] = useState('');

    useEffect(() => {
        if (!lessonId) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setLoading(true);
        setError('');
        setAssignments([]);

        getAssignmentsByLesson(lessonId, token)
            .then(res => {
                const data = res.data?.data || res.data || [];
                setAssignments(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setError('Không tải được danh sách bài tập (assignment) của bài học này.');
            })
            .finally(() => setLoading(false));
    }, [lessonId]);

    const openSubmissions = async (assignment) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setNotifyMsg('Bạn cần đăng nhập với vai trò Instructor.');
            setNotifyOpen(true);
            return;
        }
        setCurrentAssignment(assignment);
        setSubmissions([]);
        setSubmissionsError('');
        setSubmissionsLoading(true);
        setSubmissionsDialogOpen(true);

        try {
            const res = await getAssignmentSubmissions(assignment.id, token);
            const data = res.data?.data || res.data || [];
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setSubmissionsError('Không tải được danh sách bài nộp.');
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const openGradeDialog = (submission) => {
        setGradingSubmission(submission);
        setScore(
            submission.score !== null && submission.score !== undefined
                ? String(submission.score)
                : ''
        );
        setFeedback(submission.feedback || '');
        setGradeDialogOpen(true);
    };

    const handleGrade = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setNotifyMsg('Bạn cần đăng nhập với vai trò Instructor.');
            setNotifyOpen(true);
            return;
        }
        if (!gradingSubmission) return;

        const numericScore = score === '' ? null : Number(score);
        if (numericScore !== null && isNaN(numericScore)) {
            setNotifyMsg('Điểm phải là số hoặc để trống.');
            setNotifyOpen(true);
            return;
        }

        setGrading(true);
        try {
            const payload = {
                submissionId: gradingSubmission.id,
                score: numericScore,
                feedback: feedback || null
            };
            const res = await gradeAssignmentSubmission(payload, token);
            const updated = res.data?.data || res.data;

            // Cập nhật lại trong danh sách submissions
            setSubmissions(prev =>
                prev.map(s => (s.id === updated.id ? updated : s))
            );

            setNotifyMsg('Đã lưu điểm và nhận xét.');
            setNotifyOpen(true);
            setGradeDialogOpen(false);
        } catch (e) {
            console.error(e);
            const backendMsg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                'Chấm điểm thất bại.';
            setNotifyMsg(backendMsg);
            setNotifyOpen(true);
        } finally {
            setGrading(false);
        }
    };

    if (!lessonId) return null;

    return (
        <>
            <Box
                sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(115deg,#f3e5f5 0%,#e3f2fd 100%)',
                    boxShadow: '0 4px 18px #00000014'
                }}
            >
                <Typography variant="h6" fontWeight={700} color="#6a1b9a" mb={1.5}>
                    🧑‍🏫 Bài tập & chấm điểm (Instructor)
                </Typography>

                {loading && (
                    <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={20} />
                        <Typography>Đang tải danh sách bài tập...</Typography>
                    </Box>
                )}

                {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}

                {!loading && !error && assignments.length === 0 && (
                    <Typography sx={{ mt: 1 }}>
                        Chưa có bài tập nào cho bài học này.
                    </Typography>
                )}

                {!loading &&
                    !error &&
                    assignments.map(a => (
                        <Paper
                            key={a.id}
                            elevation={2}
                            sx={{
                                mb: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#ffffffd9'
                            }}
                        >
                            <Box>
                                <Typography fontWeight={600}>{a.title}</Typography>
                                {a.dueAt && (
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#757575' }}
                                    >
                                        Hạn nộp:{' '}
                                        {new Date(a.dueAt).toLocaleString('vi-VN')}
                                    </Typography>
                                )}
                                {a.maxScore != null && (
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#757575' }}
                                    >
                                        Điểm tối đa: {a.maxScore}
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                                onClick={() => openSubmissions(a)}
                            >
                                Xem bài nộp
                            </Button>
                        </Paper>
                    ))}
            </Box>

            {/* Dialog danh sách bài nộp */}
            <Dialog
                open={submissionsDialogOpen}
                onClose={() => setSubmissionsDialogOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {currentAssignment
                        ? `Bài nộp - ${currentAssignment.title}`
                        : 'Bài nộp'}
                </DialogTitle>
                <DialogContent dividers>
                    {submissionsLoading ? (
                        <Box display="flex" justifyContent="center" py={2}>
                            <CircularProgress />
                        </Box>
                    ) : submissionsError ? (
                        <Typography color="error">{submissionsError}</Typography>
                    ) : submissions.length === 0 ? (
                        <Typography>Chưa có sinh viên nào nộp bài.</Typography>
                    ) : (
                        <Box>
                            {submissions.map(s => (
                                <Paper
                                    key={s.id}
                                    elevation={1}
                                    sx={{
                                        mb: 1.5,
                                        p: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: '#fafafa'
                                    }}
                                >
                                    <Typography fontWeight={600}>
                                        {s.studentName || `Student #${s.studentId}`}
                                    </Typography>
                                    <Typography variant="body2">
                                        Nộp lúc:{' '}
                                        {s.submittedAt
                                            ? new Date(
                                                s.submittedAt
                                            ).toLocaleString('vi-VN')
                                            : '—'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Điểm:{' '}
                                        {s.score !== null && s.score !== undefined
                                            ? s.score
                                            : 'Chưa chấm'}
                                    </Typography>
                                    {s.feedback && (
                                        <Typography
                                            variant="body2"
                                            sx={{ whiteSpace: 'pre-line' }}
                                        >
                                            Nhận xét: {s.feedback}
                                        </Typography>
                                    )}
                                    <Box mt={1}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => openGradeDialog(s)}
                                        >
                                            {s.score === null ||
                                                s.score === undefined
                                                ? 'Chấm điểm'
                                                : 'Sửa điểm'}
                                        </Button>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubmissionsDialogOpen(false)}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog chấm điểm */}
            <Dialog
                open={gradeDialogOpen}
                onClose={() => !grading && setGradeDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {gradingSubmission
                        ? `Chấm điểm - ${gradingSubmission.studentName || ''}`
                        : 'Chấm điểm'}
                </DialogTitle>
                <DialogContent dividers>
                    {gradingSubmission && (
                        <>
                            <TextField
                                label="Điểm"
                                type="number"
                                fullWidth
                                sx={{ mb: 2 }}
                                value={score}
                                onChange={e => setScore(e.target.value)}
                                inputProps={{ min: 0 }}
                            />
                            <TextField
                                label="Nhận xét"
                                fullWidth
                                multiline
                                minRows={3}
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setGradeDialogOpen(false)}
                        disabled={grading}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleGrade}
                        disabled={grading || !gradingSubmission}
                    >
                        {grading ? 'Đang lưu...' : 'Lưu điểm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog thông báo */}
            <Dialog open={notifyOpen} onClose={() => setNotifyOpen(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Thông báo</DialogTitle>
                <DialogContent>
                    <Typography>{notifyMsg}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNotifyOpen(false)} autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default InstructorAssignments;
