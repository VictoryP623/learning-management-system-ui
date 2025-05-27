import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Rating,
    TextField,
    Button,
    Paper,
    Alert,
    Dialog,
    DialogTitle,
    DialogActions
} from '@mui/material';
import { getMyReviewByCourse, submitReview, updateReview, deleteReview } from '../services/api';

function CourseReviewPage() {
    const { id: courseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [review, setReview] = useState(location.state?.review || null);
    const [rating, setRating] = useState(review?.rating || 0);
    const [comment, setComment] = useState(review?.description || '');
    const [editing, setEditing] = useState(!review);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmUpdate, setConfirmUpdate] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    const fetchReview = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await getMyReviewByCourse(courseId, token);
            setReview(res.data.data);
            setRating(res.data.data.rating || 0);
            setComment(res.data.data.description || '');
            setEditing(false);
        } catch {
            setReview(null);
            setRating(0);
            setComment('');
            setEditing(true);
        }
    };

    useEffect(() => {
        fetchReview();
        // eslint-disable-next-line
    }, [courseId]);

    const handleConfirmUpdate = async () => {
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        const token = localStorage.getItem('accessToken');
        try {
            await updateReview({
                id: { courseId: Number(courseId) },
                description: comment,
                rating: rating,
            }, token);
            setSuccessMsg('Cập nhật đánh giá thành công!');
            await fetchReview();
            setTimeout(() => {
                navigate('/my-courses');
            }, 1200);
        } catch (err) {
            setErrorMsg('Cập nhật đánh giá thất bại!');
        }
        setLoading(false);
        setConfirmUpdate(false);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        const token = localStorage.getItem('accessToken');
        try {
            await submitReview({
                id: { courseId: Number(courseId) },
                description: comment,
                rating: rating,
            }, token);
            setSuccessMsg('Đánh giá thành công!');
            await fetchReview();
            setTimeout(() => {
                navigate('/my-courses');
            }, 1200);
        } catch (err) {
            setErrorMsg('Gửi đánh giá thất bại!');
        }
        setLoading(false);
        setConfirmSubmit(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (review && editing) {
            setConfirmUpdate(true);
        } else if (!review) {
            setConfirmSubmit(true);
        }
    };

    const handleEdit = () => setEditing(true);

    const handleDelete = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            await deleteReview(courseId, token);
            setSuccessMsg('Xóa đánh giá thành công!');
            setErrorMsg('');
            await fetchReview();
        } catch {
            setErrorMsg('Xóa đánh giá thất bại!');
        }
        setConfirmDelete(false);
    };

    return (
        <Box
            sx={{
                minHeight: '70vh',
                background: 'linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)',
                py: 8
            }}
        >
            <Paper
                elevation={5}
                sx={{
                    width: '100%',
                    maxWidth: 520,
                    mx: 'auto',
                    p: 5,
                    borderRadius: 4,
                    boxShadow: '0 8px 32px #1677ff18',
                    mt: { xs: 2, md: 5 }
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                    align="center"
                    sx={{ color: "#1566c2", mb: 1, letterSpacing: 0.5 }}
                >
                    Đánh giá khoá học
                </Typography>
                <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{ mb: 3, color: "#4a4a4a" }}
                >
                    Bạn nghĩ gì về khoá học này?
                </Typography>
                {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
                {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: "center" }}>
                        <Typography sx={{ mr: 2, fontWeight: 500, fontSize: 17 }}>Đánh giá:</Typography>
                        <Rating
                            value={rating}
                            onChange={editing ? (e, newValue) => setRating(newValue) : undefined}
                            precision={1}
                            size="large"
                            readOnly={!editing}
                        />
                    </Box>
                    <TextField
                        label="Nhận xét (không bắt buộc)"
                        multiline
                        rows={4}
                        fullWidth
                        value={comment}
                        onChange={editing ? (e) => setComment(e.target.value) : undefined}
                        sx={{ mb: 3 }}
                        InputProps={{ readOnly: !editing }}
                    />
                    {editing ? (
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || rating === 0}
                            sx={{
                                fontWeight: 700, px: 4, borderRadius: 2,
                                boxShadow: '0 2px 12px #1677ff19'
                            }}
                            fullWidth
                        >
                            {loading ? "Đang gửi..." : (review ? "Cập nhật đánh giá" : "Gửi đánh giá")}
                        </Button>
                    ) : (
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}
                                onClick={handleEdit}
                                fullWidth
                            >
                                Chỉnh sửa
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setConfirmDelete(true)}
                                sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}
                                fullWidth
                            >
                                Xóa đánh giá
                            </Button>
                        </Box>
                    )}
                </form>
            </Paper>

            {/* Dialog xác nhận xóa */}
            <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
                <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>
                    Bạn có chắc chắn muốn xóa đánh giá này không?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(false)}>Hủy</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        sx={{ fontWeight: 600 }}
                    >
                        Xóa đánh giá
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận cập nhật */}
            <Dialog open={confirmUpdate} onClose={() => setConfirmUpdate(false)}>
                <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>
                    Bạn có chắc chắn muốn cập nhật đánh giá này không?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmUpdate(false)}>Hủy</Button>
                    <Button
                        onClick={handleConfirmUpdate}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        sx={{ fontWeight: 600 }}
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận gửi mới */}
            <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}>
                <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>
                    Bạn có chắc chắn muốn gửi đánh giá này không?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmSubmit(false)}>Hủy</Button>
                    <Button
                        onClick={handleConfirmSubmit}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        sx={{ fontWeight: 600 }}
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CourseReviewPage;
