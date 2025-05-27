import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Button, Box, Typography, LinearProgress, List, ListItem, ListItemText,
    ListItemSecondaryAction, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getCourseDetail, markLessonCompleted, getLessonDetail } from '../services/api';
import LessonQuiz from '../components/LessonQuiz';

const LearningPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resourceError, setResourceError] = useState('');
    const [completeLoading, setCompleteLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMsg, setDialogMsg] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        getCourseDetail(courseId, token).then(res => {
            setCourse(res.data);
            const completedArr = (res.data.lessons || []).filter(l => l.completed).map(l => l.id);
            setCompletedLessons(completedArr);
            setLoading(false);
        });
    }, [courseId]);

    const handleSelectLesson = async (lessonId) => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await getLessonDetail(lessonId, token);
            setSelectedLesson(res.data);
            setResourceError('');
        } catch {
            setResourceError('Không tải được nội dung bài học!');
        }
    };

    const handleCompleteLesson = async (lessonId) => {
        setCompleteLoading(true);
        const token = localStorage.getItem('accessToken');
        try {
            await markLessonCompleted(lessonId, token);
            setCompletedLessons(prev => Array.isArray(prev) ? [...prev, lessonId] : [lessonId]);
            setDialogMsg('Đã đánh dấu hoàn thành bài học!');
        } catch (err) {
            if (err?.response?.status === 409) {
                setDialogMsg('Bài học này đã được đánh dấu hoàn thành trước đó!');
                setCompletedLessons(prev => Array.isArray(prev) ? [...prev, lessonId] : [lessonId]);
            } else {
                setDialogMsg('Không thể đánh dấu hoàn thành!');
            }
        }
        setOpenDialog(true);
        setCompleteLoading(false);
    };

    if (loading || !course)
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)',
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 26, fontWeight: 700
            }}>
                Đang tải...
            </div>
        );

    const total = Array.isArray(course.lessons) ? course.lessons.length : 0;
    const completed = Array.isArray(completedLessons) ? completedLessons.length : 0;

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            padding: "0 0 24px 0"
        }}>
            <Box sx={{
                width: "97%",
                maxWidth: 950,
                mx: "auto",
                pt: 5,
                pb: 5
            }}>
                {/* Card lessons */}
                <Paper
                    elevation={4}
                    sx={{
                        mb: 4,
                        borderRadius: 5,
                        background: "#fff",
                        boxShadow: "0 8px 32px #1677ff20",
                        p: 3
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <img src={course.thumbnail} alt="" style={{
                            width: 68, height: 44, borderRadius: 8, marginRight: 14, objectFit: 'cover', boxShadow: "0 2px 9px #1677ff18"
                        }} />
                        <Typography fontWeight={800} fontSize={22} color="#1566c2">
                            {course.name}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography color="primary" fontWeight="bold" fontSize={16}>
                            {completed} / {total} bài học đã hoàn thành
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={total === 0 ? 0 : (completed / total) * 100}
                        sx={{ mb: 2, height: 11, borderRadius: 7, background: "#e0ecff" }}
                    />
                    <Typography variant="h6" sx={{ color: "#1677ff", fontWeight: 700, fontSize: 17, mb: 1 }}>
                        Danh sách bài học
                    </Typography>
                    <List>
                        {(Array.isArray(course.lessons) ? course.lessons : []).map(lesson => (
                            <ListItem
                                key={lesson.id}
                                sx={{
                                    bgcolor: Array.isArray(completedLessons) && completedLessons.includes(lesson.id)
                                        ? "#e7ffe5"
                                        : "#fafdff",
                                    transition: "background 0.15s",
                                    mb: 0.5,
                                    borderLeft: Array.isArray(completedLessons) && completedLessons.includes(lesson.id)
                                        ? "4px solid #2ab748"
                                        : "4px solid #fff",
                                    borderRadius: 2
                                }}
                                button
                                onClick={() => handleSelectLesson(lesson.id)}
                            >
                                <ListItemText
                                    primary={
                                        <span style={{ fontWeight: 700, color: "#23262a" }}>{lesson.name}</span>
                                    }
                                    secondary={
                                        <span style={{ color: "#8291ae", fontSize: 14 }}>
                                            {lesson.description ? lesson.description.slice(0, 64) + "..." : ""}
                                        </span>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Button
                                        variant={Array.isArray(completedLessons) && completedLessons.includes(lesson.id) ? "outlined" : "contained"}
                                        color={Array.isArray(completedLessons) && completedLessons.includes(lesson.id) ? "success" : "primary"}
                                        sx={{
                                            minWidth: 100,
                                            fontWeight: 700,
                                            borderRadius: 3,
                                            boxShadow: "0 2px 8px #1677ff09"
                                        }}
                                        onClick={() => handleSelectLesson(lesson.id)}
                                    >
                                        {Array.isArray(completedLessons) && completedLessons.includes(lesson.id) ? "Hoàn thành" : "Vào học"}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Card nội dung bài học */}
                <Paper
                    elevation={4}
                    sx={{
                        borderRadius: 5,
                        background: "#fff",
                        boxShadow: "0 8px 32px #1677ff15",
                        p: 4,
                        minHeight: 200
                    }}
                >
                    {!selectedLesson ? (
                        <Typography sx={{
                            color: "#8da5be",
                            fontWeight: 600,
                            fontSize: 22,
                            textAlign: "center",
                            mt: 5
                        }}>
                            Chọn một bài học để bắt đầu học!
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="h5" fontWeight={800} color="#1566c2">{selectedLesson.name}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography sx={{ mb: 2 }}>{selectedLesson.description}</Typography>
                            {/* Hiển thị resource */}
                            {selectedLesson.resourceUrl && (
                                <Box sx={{ mb: 2 }}>
                                    {selectedLesson.resourceUrl.endsWith('.mp4') ? (
                                        <video src={selectedLesson.resourceUrl} controls width="100%" style={{ maxWidth: 520, marginBottom: 16, borderRadius: 8, boxShadow: "0 2px 18px #1677ff15" }} />
                                    ) : /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedLesson.resourceUrl) ? (
                                        <img src={selectedLesson.resourceUrl} alt="Resource" style={{ maxWidth: 320, borderRadius: 8, marginBottom: 16, boxShadow: "0 2px 12px #1677ff19" }} />
                                    ) : selectedLesson.resourceUrl.endsWith('.pdf') ? (
                                        <iframe src={selectedLesson.resourceUrl} width="100%" height={420} title="Lesson Resource"
                                            style={{ borderRadius: 8, boxShadow: "0 2px 12px #1677ff12" }}
                                        />
                                    ) : (
                                        <a href={selectedLesson.resourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1677ff", fontWeight: 600 }}>Tải tài liệu</a>
                                    )}
                                </Box>
                            )}
                            {resourceError && (
                                <Typography color="error" sx={{ mb: 2 }}>{resourceError}</Typography>
                            )}

                            {/* Quiz cho bài học */}
                            <LessonQuiz lessonId={selectedLesson.id} />

                            {/* Nút hoàn thành bài học */}
                            {Array.isArray(completedLessons) && !completedLessons.includes(selectedLesson.id) && (
                                <Box sx={{ mt: 3, textAlign: 'right' }}>
                                    <Button
                                        color="success"
                                        variant="contained"
                                        sx={{ fontWeight: 700, px: 4, borderRadius: 3 }}
                                        onClick={() => handleCompleteLesson(selectedLesson.id)}
                                        disabled={completeLoading}
                                    >
                                        {completeLoading ? "Đang xử lý..." : "Đánh dấu hoàn thành bài học"}
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </Paper>
            </Box>
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
        </div>
    );
};

export default LearningPage;
