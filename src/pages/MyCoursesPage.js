import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Avatar, Rating, Typography, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getStudentPurchasedCourses, getMyReviewByCourse } from '../services/api';

function MyCoursePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myReviews, setMyReviews] = useState({});
    const [error] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        getStudentPurchasedCourses(token).then(res => {
            const data = res.data.data || [];
            setCourses(data);

            Promise.all(data.map(course =>
                getMyReviewByCourse(course.id, token)
                    .then(res => ({ courseId: course.id, review: res.data.data }))
                    .catch(() => ({ courseId: course.id, review: null }))
            )).then(results => {
                const reviewMap = {};
                results.forEach(({ courseId, review }) => {
                    reviewMap[courseId] = review;
                });
                setMyReviews(reviewMap);
                setLoading(false);
            });
        });
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) return (
        <div style={{
            minHeight: "75vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)"
        }}>
            <Typography variant="h6" color="#fff">Đang tải...</Typography>
        </div>
    );
    if (error) return <div>{error}</div>;

    return (
        <div style={{
            minHeight: "75vh",
            background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
            padding: "48px 0"
        }}>
            <Box
                sx={{
                    width: "98%",
                    maxWidth: 1150,
                    mx: "auto",
                    mt: 2,
                    mb: 8,
                    background: "#fff",
                    borderRadius: 6,
                    boxShadow: "0 6px 32px 0 #00306e22",
                    p: { xs: 2, md: 5 }
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        letterSpacing: 1,
                        mb: 3,
                        color: "#1677ff",
                        textShadow: "0 2px 8px #1677ff20"
                    }}
                >
                    Các khóa học của tôi
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 12px #1677ff08"
                }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: "#f6f8ff" }}>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#1677ff" }}>Ảnh</TableCell>
                                <TableCell align="left" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>Tên khóa học</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>Giá</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>Ngày mua</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#1677ff" }}>Trạng thái</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>Đánh giá</TableCell>
                                <TableCell align="center"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ color: "#888" }}>Chưa mua khóa học nào.</TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => {
                                    let completed = typeof course.completedLessons === "number"
                                        ? course.completedLessons
                                        : (course.lessons?.filter(l => l.completed).length || 0);

                                    let total = typeof course.totalLessons === "number"
                                        ? course.totalLessons
                                        : (course.lessons?.length || 0);

                                    const allCompleted = total > 0 && completed === total;
                                    const review = myReviews[course.id];
                                    const hasReview = review && typeof review.rating === "number";

                                    return (
                                        <TableRow key={course.id} sx={{ height: 80 }}>
                                            <TableCell align="center">
                                                <Avatar
                                                    variant="rounded"
                                                    src={course.thumbnail || 'https://via.placeholder.com/80'}
                                                    sx={{
                                                        width: 54,
                                                        height: 54,
                                                        mx: "auto",
                                                        boxShadow: "0 1.5px 10px #1677ff22"
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="left">
                                                <Typography fontWeight="500" sx={{ fontSize: 16 }}>{course.name}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography sx={{ color: "#1566c2" }}>{course.price?.toLocaleString()} $</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography sx={{ color: "#6e7892", fontSize: 15 }}>{formatDate(course.createdAt)}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography color={allCompleted ? "success.main" : "#1677ff"} fontWeight="bold">
                                                    {`${completed} / ${total}`}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Rating
                                                    value={hasReview ? review.rating : 0}
                                                    precision={0.5}
                                                    readOnly
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            borderRadius: 3,
                                                            minWidth: 90,
                                                            background: "#1677ff",
                                                            letterSpacing: 0.4,
                                                            boxShadow: "0 2px 10px #1677ff25",
                                                            "&:hover": { background: "#1566c2" }
                                                        }}
                                                        onClick={() => navigate(`/courses/${course.id}/learn`)}
                                                    >
                                                        VÀO HỌC
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 3,
                                                            minWidth: 120,
                                                            fontWeight: "bold",
                                                            color: allCompleted ? "#1677ff" : "#bbb",
                                                            borderColor: allCompleted ? "#1677ff" : "#ddd",
                                                            letterSpacing: 0.2
                                                        }}
                                                        variant="outlined"
                                                        disabled={!allCompleted}
                                                        onClick={() => {
                                                            if (allCompleted) {
                                                                if (myReviews[course.id])
                                                                    navigate(`/courses/${course.id}/review`, { state: { review: myReviews[course.id] } });
                                                                else
                                                                    navigate(`/courses/${course.id}/review`);
                                                            }
                                                        }}
                                                    >
                                                        {myReviews[course.id] ? "SỬA ĐÁNH GIÁ" : "ĐÁNH GIÁ"}
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </div>
    );
}

export default MyCoursePage;
