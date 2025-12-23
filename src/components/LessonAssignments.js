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
    getAssignmentDetail,
    submitAssignment,
    getMyAssignmentSubmission
} from '../services/api';

function LessonAssignments({ lessonId }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [textAnswer, setTextAnswer] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyMsg, setNotifyMsg] = useState('');

    // NEW: lưu bài nộp trước đó (nếu có)
    const [previousSubmission, setPreviousSubmission] = useState(null);
    // NEW: trạng thái đang cho phép chỉnh sửa hay chỉ xem
    const [isEditing, setIsEditing] = useState(true);

    useEffect(() => {
        if (!lessonId) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setLoading(true);
        setError('');
        setAssignments([]);
        setSelectedAssignment(null);
        setPreviousSubmission(null);
        setIsEditing(true);

        getAssignmentsByLesson(lessonId, token)
            .then(res => {
                const data = res.data?.data || res.data || [];
                setAssignments(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setError('Không tải được danh sách bài tập.');
            })
            .finally(() => setLoading(false));
    }, [lessonId]);

    const handleOpenAssignment = async (assignmentId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setNotifyMsg('Bạn cần đăng nhập để xem và nộp bài tập.');
            setNotifyOpen(true);
            return;
        }

        setDetailLoading(true);
        setTextAnswer('');
        setAttachmentUrl('');
        setPreviousSubmission(null);
        setIsEditing(true);

        try {
            // Gọi song song detail + my-submission
            const [detailRes, mySubRes] = await Promise.all([
                getAssignmentDetail(assignmentId, token),
                getMyAssignmentSubmission(assignmentId, token).catch(e => {
                    // Nếu 204 (no content) thì coi như chưa nộp
                    if (e?.response?.status === 204) {
                        return null;
                    }
                    // lỗi khác thì ném lại
                    throw e;
                })
            ]);

            const detailData = detailRes.data?.data || detailRes.data;
            setSelectedAssignment(detailData);

            if (mySubRes && mySubRes.status === 200) {
                const subData = mySubRes.data?.data || mySubRes.data;
                setPreviousSubmission(subData);
                setTextAnswer(subData.textAnswer || '');
                setAttachmentUrl(subData.attachmentUrl || '');
                setIsEditing(false); // mặc định chỉ xem, phải bấm "Chỉnh sửa"
            } else {
                // chưa có bài nộp
                setPreviousSubmission(null);
                setTextAnswer('');
                setAttachmentUrl('');
                setIsEditing(true);
            }

            setDialogOpen(true);
        } catch (e) {
            console.error(e);
            setNotifyMsg('Không tải được chi tiết bài tập.');
            setNotifyOpen(true);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setNotifyMsg('Bạn cần đăng nhập để nộp bài tập.');
            setNotifyOpen(true);
            return;
        }
        if (!selectedAssignment) return;

        // Check deadline ở FE cho UX (BE vẫn check lại)
        if (selectedAssignment.dueAt) {
            const now = new Date();
            const due = new Date(selectedAssignment.dueAt);
            if (now > due) {
                setNotifyMsg('Bài tập đã quá hạn, bạn không thể nộp nữa.');
                setNotifyOpen(true);
                return;
            }
        }

        if (!textAnswer && !attachmentUrl) {
            setNotifyMsg('Vui lòng nhập nội dung hoặc cung cấp link file đính kèm.');
            setNotifyOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                assignmentId: selectedAssignment.id,
                textAnswer: textAnswer || null,
                attachmentUrl: attachmentUrl || null
            };
            await submitAssignment(payload, token);

            setNotifyMsg(
                previousSubmission
                    ? 'Đã cập nhật bài nộp thành công!'
                    : 'Nộp bài thành công!'
            );
            setNotifyOpen(true);

            // Sau khi nộp xong, coi như có submission mới → khoá lại, chỉ xem
            setPreviousSubmission({
                ...(previousSubmission || {}),
                textAnswer: textAnswer || null,
                attachmentUrl: attachmentUrl || null,
                submittedAt: new Date().toISOString()
            });
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            const backendMsg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                'Nộp bài thất bại. Vui lòng thử lại.';
            setNotifyMsg(backendMsg);
            setNotifyOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (!lessonId) return null;

    if (loading) {
        return (
            <Box mt={4} display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} />
                <Typography>Đang tải bài tập...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={4}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!assignments.length) {
        return null;
    }

    const isOverDeadline =
        selectedAssignment && selectedAssignment.dueAt
            ? new Date() > new Date(selectedAssignment.dueAt)
            : false;

    return (
        <>
            <Box
                sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(115deg,#fff8e1 0%,#e3f2fd 100%)',
                    boxShadow: '0 4px 18px #00000014'
                }}
            >
                <Typography variant="h6" fontWeight={700} color="#f57c00" mb={1.5}>
                    📚 Bài tập của bài học
                </Typography>

                {assignments.map((a) => (
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
                            variant="contained"
                            size="small"
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                            onClick={() => handleOpenAssignment(a.id)}
                        >
                            Xem / nộp
                        </Button>
                    </Paper>
                ))}
            </Box>

            {/* Dialog chi tiết + form nộp */}
            <Dialog
                open={dialogOpen}
                onClose={() => !submitting && setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {selectedAssignment ? selectedAssignment.title : 'Bài tập'}
                </DialogTitle>
                <DialogContent dividers>
                    {detailLoading || !selectedAssignment ? (
                        <Box display="flex" justifyContent="center" py={2}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {selectedAssignment.description && (
                                <Typography sx={{ mb: 1.5 }}>
                                    {selectedAssignment.description}
                                </Typography>
                            )}

                            {selectedAssignment.dueAt && (
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    Hạn nộp:{' '}
                                    {new Date(
                                        selectedAssignment.dueAt
                                    ).toLocaleString('vi-VN')}
                                </Typography>
                            )}

                            {selectedAssignment.maxScore != null && (
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Điểm tối đa: {selectedAssignment.maxScore}
                                </Typography>
                            )}

                            {previousSubmission && (
                                <Typography
                                    variant="body2"
                                    sx={{ mb: 1, color: '#2e7d32' }}
                                >
                                    Bạn đã nộp bài lúc:{' '}
                                    {previousSubmission.submittedAt
                                        ? new Date(
                                            previousSubmission.submittedAt
                                        ).toLocaleString('vi-VN')
                                        : '—'}
                                </Typography>
                            )}

                            {isOverDeadline && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mb: 2,
                                        color: 'error.main',
                                        fontWeight: 600
                                    }}
                                >
                                    Bài tập đã quá hạn nộp. Bạn không thể nộp nữa.
                                </Typography>
                            )}

                            <Box mt={2}>
                                <Typography fontWeight={600} mb={1}>
                                    Nộp bài
                                </Typography>
                                <TextField
                                    label="Nội dung bài làm"
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    sx={{ mb: 2 }}
                                    value={textAnswer}
                                    onChange={(e) => setTextAnswer(e.target.value)}
                                    disabled={isOverDeadline || !isEditing}
                                />
                                <TextField
                                    label="Link file đính kèm (Google Drive, OneDrive, ... nếu có)"
                                    fullWidth
                                    value={attachmentUrl}
                                    onChange={(e) =>
                                        setAttachmentUrl(e.target.value)
                                    }
                                    disabled={isOverDeadline || !isEditing}
                                />
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogOpen(false);
                        }}
                        disabled={submitting}
                    >
                        Đóng
                    </Button>

                    {/* Nếu đã có bài nộp và chưa quá hạn → cho nút Chỉnh sửa */}
                    {previousSubmission && !isOverDeadline && !isEditing && (
                        <Button
                            onClick={() => setIsEditing(true)}
                            disabled={submitting}
                        >
                            Chỉnh sửa
                        </Button>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={
                            submitting ||
                            detailLoading ||
                            isOverDeadline ||
                            !isEditing
                        }
                    >
                        {previousSubmission ? 'Lưu & nộp lại' : 'Nộp bài'}
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

export default LessonAssignments;
