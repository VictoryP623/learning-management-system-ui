import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Avatar,
    Rating,
    Typography,
    Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getStudentPurchasedCourses, getMyReviewByCourse } from "../services/api";

function MyCoursePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // map: courseId -> review | null
    const [myReviews, setMyReviews] = useState({});

    const [error, setError] = useState("");
    const navigate = useNavigate();

    // 404 = chưa có review => return null (không coi là lỗi)
    const getMyReviewByCourseSafe = async (courseId, token) => {
        try {
            const res = await getMyReviewByCourse(courseId, token);
            // tuỳ BE của bạn: res.data.data hoặc res.data
            return res?.data?.data ?? res?.data ?? null;
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) return null; // chưa review
            throw err; // lỗi khác mới throw
        }
    };

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            const token = localStorage.getItem("accessToken");
            setLoading(true);
            setError("");

            try {
                // 1) courses đã mua
                const res = await getStudentPurchasedCourses(token);
                const data = res?.data?.data || [];
                if (!mounted) return;

                setCourses(data);

                // 2) fetch review theo từng course (404 -> null)
                // NOTE: Network vẫn hiện 404 là bình thường nếu BE trả 404.
                // Nhưng code sẽ không throw / không spam alert.
                const results = await Promise.all(
                    data.map(async (course) => {
                        const review = await getMyReviewByCourseSafe(course.id, token);
                        return { courseId: course.id, review };
                    })
                );

                if (!mounted) return;

                const reviewMap = {};
                results.forEach(({ courseId, review }) => {
                    reviewMap[courseId] = review; // review có thể null
                });
                setMyReviews(reviewMap);
            } catch (err) {
                console.error(err);
                if (!mounted) return;
                setError("Không thể tải danh sách khóa học. Vui lòng thử lại.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        run();

        return () => {
            mounted = false;
        };
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (loading)
        return (
            <div
                style={{
                    minHeight: "75vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                }}
            >
                <Typography variant="h6" color="#fff">
                    Đang tải...
                </Typography>
            </div>
        );

    if (error)
        return (
            <div
                style={{
                    minHeight: "75vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                    padding: 24,
                }}
            >
                <Box
                    sx={{
                        background: "#fff",
                        borderRadius: 4,
                        p: 3,
                        boxShadow: "0 6px 32px 0 #00306e22",
                        maxWidth: 520,
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    <Typography fontWeight={800} sx={{ color: "#d32f2f", mb: 1 }}>
                        Có lỗi xảy ra
                    </Typography>
                    <Typography sx={{ color: "#444" }}>{error}</Typography>
                    <Button
                        sx={{ mt: 2, borderRadius: 3, fontWeight: 800 }}
                        variant="contained"
                        onClick={() => window.location.reload()}
                    >
                        Tải lại
                    </Button>
                </Box>
            </div>
        );

    return (
        <div
            style={{
                minHeight: "75vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                padding: "48px 0",
            }}
        >
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
                    p: { xs: 2, md: 5 },
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
                        textShadow: "0 2px 8px #1677ff20",
                    }}
                >
                    Các khóa học của tôi
                </Typography>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        boxShadow: "0 2px 12px #1677ff08",
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: "#f6f8ff" }}>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#1677ff" }}>
                                    Ảnh
                                </TableCell>
                                <TableCell align="left" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>
                                    Tên khóa học
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>
                                    Giá
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>
                                    Ngày mua
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#1677ff" }}>
                                    Trạng thái
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", fontSize: 16, color: "#23262a" }}>
                                    Đánh giá
                                </TableCell>
                                <TableCell align="center"></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ color: "#888" }}>
                                        Chưa mua khóa học nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => {
                                    const completed =
                                        typeof course.completedLessons === "number"
                                            ? course.completedLessons
                                            : course.lessons?.filter((l) => l.completed).length || 0;

                                    const total =
                                        typeof course.totalLessons === "number"
                                            ? course.totalLessons
                                            : course.lessons?.length || 0;

                                    const allCompleted = total > 0 && completed === total;

                                    const review = myReviews[course.id] ?? null;
                                    const hasReview = !!review && typeof review.rating === "number";

                                    return (
                                        <TableRow key={course.id} sx={{ height: 80 }}>
                                            <TableCell align="center">
                                                <Avatar
                                                    variant="rounded"
                                                    src={course.thumbnail || "https://via.placeholder.com/80"}
                                                    sx={{
                                                        width: 54,
                                                        height: 54,
                                                        mx: "auto",
                                                        boxShadow: "0 1.5px 10px #1677ff22",
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="left">
                                                <Typography fontWeight="500" sx={{ fontSize: 16 }}>
                                                    {course.name}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography sx={{ color: "#1566c2" }}>
                                                    {course.price?.toLocaleString()} $
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography sx={{ color: "#6e7892", fontSize: 15 }}>
                                                    {formatDate(course.createdAt)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography color={allCompleted ? "success.main" : "#1677ff"} fontWeight="bold">
                                                    {`${completed} / ${total}`}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Rating value={hasReview ? review.rating : 0} precision={0.5} readOnly size="small" />
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
                                                            "&:hover": { background: "#1566c2" },
                                                        }}
                                                        onClick={() => navigate(`/courses/${course.id}/learn`)}
                                                    >
                                                        VÀO HỌC
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 3,
                                                            minWidth: 130,
                                                            fontWeight: "bold",
                                                            borderColor: "#1677ff",
                                                            color: "#1677ff",
                                                            letterSpacing: 0.2,
                                                        }}
                                                        onClick={() => navigate(`/courses/${course.id}/assignments`)}
                                                    >
                                                        ASSIGNMENTS
                                                    </Button>

                                                    <Button
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 3,
                                                            minWidth: 120,
                                                            fontWeight: "bold",
                                                            color: allCompleted ? "#1677ff" : "#bbb",
                                                            borderColor: allCompleted ? "#1677ff" : "#ddd",
                                                            letterSpacing: 0.2,
                                                        }}
                                                        variant="outlined"
                                                        disabled={!allCompleted}
                                                        onClick={() => {
                                                            if (!allCompleted) return;

                                                            if (review) navigate(`/courses/${course.id}/review`, { state: { review } });
                                                            else navigate(`/courses/${course.id}/review`);
                                                        }}
                                                    >
                                                        {review ? "SỬA ĐÁNH GIÁ" : "ĐÁNH GIÁ"}
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
