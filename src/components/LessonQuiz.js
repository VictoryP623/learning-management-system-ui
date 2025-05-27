import React, { useEffect, useState } from 'react';
import {
    Button, Box, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { getLessonQuiz, submitQuizAttempt } from '../services/api';

const LessonQuiz = ({ lessonId }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMsg, setDialogMsg] = useState('');

    useEffect(() => {
        if (!lessonId) return;
        const token = localStorage.getItem('accessToken');
        setLoading(true);
        getLessonQuiz(lessonId, token)
            .then(res => setQuizzes(res.data?.data || []))
            .catch(() => setQuizzes([]))
            .finally(() => setLoading(false));
        setResult(null);
        setAnswers({});
    }, [lessonId]);

    const handleChange = (quiz, answerId, isMulti) => {
        setAnswers(prev => {
            if (isMulti) {
                const arr = prev[quiz.id] || [];
                if (arr.includes(answerId)) {
                    return { ...prev, [quiz.id]: arr.filter(a => a !== answerId) };
                }
                return { ...prev, [quiz.id]: [...arr, answerId] };
            } else {
                return { ...prev, [quiz.id]: answerId };
            }
        });
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('accessToken');
        let quizAnswers = quizzes.map(quiz => {
            if (quiz.quizType === "MULTI_CHOICE") {
                return {
                    quizId: quiz.id,
                    answerIds: answers[quiz.id] || []
                };
            } else {
                return {
                    quizId: quiz.id,
                    answerIds: answers[quiz.id] !== undefined ? [answers[quiz.id]] : []
                };
            }
        });

        const missing = quizAnswers.some(q => !q.answerIds.length);
        if (missing) {
            setDialogMsg('Bạn chưa chọn đáp án cho tất cả các câu!');
            setOpenDialog(true);
            return;
        }
        try {
            const res = await submitQuizAttempt(quizAnswers, token);
            setResult(res.data);
        } catch {
            setDialogMsg('Gửi bài thất bại!');
            setOpenDialog(true);
        }
    };

    const getQuizResult = (quiz) => {
        if (!result) return null;
        const quizResult = result.find(r => r.quizId === quiz.id);
        return quizResult ? quizResult.isCorrect : null;
    };

    if (loading) return <Typography>Đang tải quiz...</Typography>;
    if (!quizzes.length) return null;

    return (
        <Box
            sx={{
                background: 'linear-gradient(115deg,#e8f5ff 0%,#f2fff7 100%)',
                borderRadius: 3,
                mt: 4,
                p: 3,
                boxShadow: '0 4px 20px #1677ff10',
                fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif"
            }}
        >
            <Typography variant="h6" fontWeight={700} gutterBottom color="#1976d2" mb={2}>
                📝 Quiz kiểm tra nhanh
            </Typography>
            {quizzes.map((quiz, idx) => {
                const isCorrect = getQuizResult(quiz);
                return (
                    <Paper
                        key={quiz.id}
                        elevation={isCorrect === true ? 5 : (isCorrect === false ? 2 : 1)}
                        sx={{
                            mb: 3,
                            p: 2.5,
                            background:
                                result
                                    ? (isCorrect === true
                                        ? '#eaffed'
                                        : isCorrect === false
                                            ? '#ffecec'
                                            : '#fff')
                                    : '#fff',
                            border: result
                                ? (isCorrect === true
                                    ? '2px solid #2ab748'
                                    : isCorrect === false
                                        ? '2px solid #f44336'
                                        : '')
                                : '1.5px solid #e7e7e7',
                            borderRadius: 3,
                            fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif"
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography fontWeight={600} fontSize={17}>
                                {`Câu ${idx + 1}: ${quiz.question}`}
                            </Typography>
                            {result && (
                                isCorrect === true ? (
                                    <Chip label="Đúng" color="success" size="small" sx={{ fontWeight: 700 }} />
                                ) : isCorrect === false ? (
                                    <Chip label="Sai" color="error" size="small" sx={{ fontWeight: 700 }} />
                                ) : null
                            )}
                        </Box>
                        <Box ml={1.5}>
                            {quiz.quizType === "MULTI_CHOICE" ? (
                                quiz.answerOptions.map(opt => (
                                    <label
                                        key={opt.keyValue}
                                        style={{
                                            display: 'block',
                                            marginBottom: 9,
                                            background: (answers[quiz.id] || []).includes(opt.keyValue) ? "#e3f0ff" : "",
                                            borderRadius: 8,
                                            padding: "3px 10px"
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={(answers[quiz.id] || []).includes(opt.keyValue)}
                                            onChange={() => handleChange(quiz, opt.keyValue, true)}
                                            disabled={!!result}
                                            style={{ marginRight: 7 }}
                                        /> {opt.text}
                                    </label>
                                ))
                            ) : (
                                quiz.answerOptions.map(opt => (
                                    <label
                                        key={opt.keyValue}
                                        style={{
                                            display: 'block',
                                            marginBottom: 9,
                                            background: answers[quiz.id] === opt.keyValue ? "#e3f0ff" : "",
                                            borderRadius: 8,
                                            padding: "3px 10px"
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`quiz_${quiz.id}`}
                                            checked={answers[quiz.id] === opt.keyValue}
                                            onChange={() => handleChange(quiz, opt.keyValue, false)}
                                            disabled={!!result}
                                            style={{ marginRight: 7 }}
                                        /> {opt.text}
                                    </label>
                                ))
                            )}
                        </Box>
                    </Paper>
                );
            })}
            {!result && (
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        mt: 2,
                        fontWeight: 700,
                        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
                        borderRadius: 2,
                        px: 4,
                        boxShadow: '0 2px 12px #1976d224'
                    }}
                    onClick={handleSubmit}
                >
                    Nộp bài
                </Button>
            )}
            {result && (
                <Box sx={{ mt: 2 }}>
                    <Typography color="success.main" fontWeight={700} fontSize={18}>
                        Số câu đúng: {result.filter(x => x.isCorrect).length} / {result.length}
                    </Typography>
                </Box>
            )}
            {/* Dialog Modal */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Thông báo</DialogTitle>
                <DialogContent>
                    <Typography>{dialogMsg}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} autoFocus>OK</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LessonQuiz;
