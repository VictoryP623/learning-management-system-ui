import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail } from '../services/api';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { jwtDecode } from "jwt-decode";
import Rating from '@mui/material/Rating'; // MUI rating cho phần sao
import axios from 'axios';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [showLessons, setShowLessons] = useState(false);
    const [previewLesson, setPreviewLesson] = useState(null);

    const [showNotify, setShowNotify] = useState(false);
    const [notifyMsg, setNotifyMsg] = useState('');

    // Role & bought courses
    const [role, setRole] = useState(null);
    const [boughtCourses, setBoughtCourses] = useState([]);
    const [loadingBought, setLoadingBought] = useState(true);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Lấy role từ JWT
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role?.toLowerCase() || null);
            } catch {
                setRole(null);
            }
        } else {
            setRole(null);
        }
    }, []);

    // Lấy thông tin đã mua (chỉ với student)
    useEffect(() => {
        if (role === "student") {
            const token = localStorage.getItem("accessToken");
            if (token) {
                fetch("http://localhost:8080/api/purchases/courses", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        setBoughtCourses(data.data ? data.data.map(c => c.id) : []);
                        setLoadingBought(false);
                    });
            }
        } else {
            setBoughtCourses([]);
            setLoadingBought(false);
        }
    }, [role]);

    // Lấy course detail
    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;
                const res = await getCourseDetail(id, token);
                setCourse(res.data);
            } catch (error) {
                setCourse(null);
            }
        };
        fetchCourseDetail();
    }, [id]);

    // Lấy review của khoá học
    useEffect(() => {
        if (!id) return;
        setLoadingReviews(true);
        const token = localStorage.getItem("accessToken");
        axios.get(`http://localhost:8080/api/students/reviews/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setReviews(res.data.data || []);
            })
            .catch(() => setReviews([]))
            .finally(() => setLoadingReviews(false));
    }, [id]);

    if (!course) return <div>Loading...</div>;
    if (course.status !== "APPROVED")
        return (
            <div
                style={{
                    minHeight: "70vh",
                    background: "linear-gradient(110deg, #1677ff 0%, #49c6e5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        padding: "48px 38px 38px 38px",
                        borderRadius: 26,
                        boxShadow: "0 8px 36px #1677ff25",
                        minWidth: 350,
                        maxWidth: 420,
                        textAlign: "center"
                    }}
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/463/463612.png"
                        alt="Warning"
                        style={{ width: 66, marginBottom: 18, opacity: 0.8 }}
                    />
                    <h3 style={{
                        color: "#1677ff",
                        fontWeight: 800,
                        marginBottom: 8,
                        fontSize: 26
                    }}>
                        Khóa học không khả dụng
                    </h3>
                    <div style={{
                        color: "#2d3d4f",
                        fontSize: 17,
                        fontWeight: 500,
                        marginBottom: 12
                    }}>
                        Khoá học này hiện chưa được duyệt hoặc đã bị từ chối.
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{
                            marginTop: 16,
                            padding: "9px 32px",
                            borderRadius: 14,
                            fontWeight: 700,
                            fontSize: 17,
                            background: "#1677ff",
                            border: "none",
                            boxShadow: "0 2px 10px #1677ff18"
                        }}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );

    // Modal preview
    const handlePreview = (lesson) => setPreviewLesson(lesson);
    const handleClosePreview = () => setPreviewLesson(null);

    // Show modal thông báo
    const showModalNotify = (msg) => {
        setNotifyMsg(msg);
        setShowNotify(true);
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showModalNotify('Bạn cần đăng nhập để sử dụng chức năng này!');
            return;
        }
        try {
            const res = await fetch(`http://localhost:8080/api/students/carts/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.statusCode === 200) {
                showModalNotify("Đã thêm vào giỏ hàng!");
                window.dispatchEvent(new Event("userChanged"));
            } else if (data.statusCode === 409 || (data.error && data.error.includes('already in the cart'))) {
                showModalNotify("Khóa học đã có trong giỏ hàng!");
            } else {
                showModalNotify(data.message || data.error || "Có lỗi xảy ra.");
            }
        } catch (e) {
            showModalNotify('Có lỗi xảy ra!');
        }
    };

    const handleBuyNow = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showModalNotify('Bạn cần đăng nhập để sử dụng chức năng này!');
            return;
        }
        // Gọi API add to cart trước
        try {
            const res = await fetch(`http://localhost:8080/api/students/carts/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            // Sau đó navigate sang purchase
            if (data.statusCode === 200 || data.message === "Đã thêm vào giỏ hàng!") {
                navigate("/purchase", { state: { selectedCourses: [course] } });
            } else {
                showModalNotify(data.message || "Có lỗi xảy ra.");
            }
        } catch (e) {
            showModalNotify('Có lỗi xảy ra!');
        }
    };

    // File preview helpers
    const isVideo = (url) => url && url.toLowerCase().endsWith('.mp4');
    const isImage = (url) => url && /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
    const isPdf = (url) => url && url.toLowerCase().endsWith('.pdf');

    // Đã mua hay chưa
    const isBought = boughtCourses.includes(Number(id));

    // Rating trung bình
    const avgRating = course.rating || (
        reviews.length > 0 ? (
            (reviews.reduce((sum, rv) => sum + (rv.rating || 0), 0) / reviews.length)
        ) : 0
    );

    // Cột đánh giá
    const renderReviewBlock = () => (
        <div className="p-4" style={{
            minWidth: 340, maxWidth: 400, background: "#f9f9fa", borderRadius: 14,
            boxShadow: "0 2px 14px #0001", margin: "0 20px"
        }}>
            <div className="mb-2" style={{ textAlign: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 19 }}>Đánh giá khoá học</span>
            </div>
            <div className="d-flex flex-column align-items-center mb-3">
                <Rating value={avgRating} precision={0.1} size="large" readOnly />
                <span style={{ color: "#888" }}>{avgRating.toFixed(1)} / 5.0</span>
                <span style={{ color: "#888", fontSize: 13 }}>{reviews.length} đánh giá</span>
            </div>
            <hr />
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
                {loadingReviews ? (
                    <div>Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ color: "#aaa" }}>Chưa có đánh giá nào cho khoá học này.</div>
                ) : (
                    reviews.map(rv => (
                        <div key={rv.id?.studentId || Math.random()} style={{
                            borderBottom: "1px solid #eee", paddingBottom: 10, marginBottom: 8
                        }}>
                            <div className="d-flex align-items-center mb-1">
                                <span style={{ fontWeight: 600 }}>{rv.studentName || "Học viên ẩn danh"}</span>
                                <span style={{ marginLeft: 8 }}>
                                    <Rating value={rv.rating} size="small" readOnly />
                                </span>
                            </div>
                            <div style={{ color: "#444" }}>{rv.description}</div>
                            <div style={{ fontSize: 12, color: "#999" }}>
                                {rv.createdAt ? new Date(rv.createdAt).toLocaleString("vi-VN") : ""}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div
            style={{
                minHeight: "75vh",
                background: "linear-gradient(110deg, #1677ff 0%, #49c6e5 100%)",
                padding: 0,
            }}
        >
            <div className="container py-5">
                <div
                    className="d-flex flex-column flex-lg-row justify-content-center align-items-start"
                    style={{ gap: 48, minHeight: 480 }}
                >
                    {/* Content Card */}
                    <div
                        className="mb-4 flex-fill d-flex flex-column align-items-center"
                        style={{
                            minWidth: 340,
                            background: "#fff",
                            borderRadius: 28,
                            boxShadow: "0 6px 36px #00306e22",
                            padding: "38px 30px 32px 30px",
                            maxWidth: 440
                        }}
                    >
                        <h2 className="mb-3 text-center" style={{ fontWeight: 900, color: "#1677ff", letterSpacing: 0.5 }}>{course.name}</h2>
                        <img
                            src={course.thumbnail}
                            alt={course.name}
                            className="img-fluid mb-3"
                            style={{
                                maxHeight: 260,
                                maxWidth: "98%",
                                borderRadius: 18,
                                boxShadow: "0 2px 12px #1677ff16",
                                objectFit: "cover",
                                marginBottom: 18
                            }}
                        />
                        {course.description && (
                            <>
                                <h5 className="mt-2 mb-1 text-center" style={{ color: "#282f3e" }}>Course Description</h5>
                                <p style={{ textAlign: "center", color: "#464a57" }}>{course.description}</p>
                            </>
                        )}
                        <div className="mt-4 w-100 d-flex flex-column align-items-center">
                            <button
                                className="btn btn-outline-info rounded-pill fw-semibold mb-2 px-4"
                                style={{ minWidth: 220, fontSize: 16 }}
                                onClick={() => setShowLessons(v => !v)}
                            >
                                {showLessons ? "Ẩn nội dung khóa học" : "Xem thêm nội dung khóa học"}
                            </button>
                            {showLessons && Array.isArray(course.lessons) && course.lessons.length > 0 && (
                                <div style={{ width: "100%", maxWidth: 380 }}>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <h6 className="mb-0" style={{ color: "#1677ff", fontWeight: 700 }}>Nội dung khóa học:</h6>
                                        <small style={{ color: "#49c6e5" }}>{course.lessons.length} bài học</small>
                                    </div>
                                    <ul className="list-group mt-2">
                                        {course.lessons.map(lesson => (
                                            <li
                                                key={lesson.id}
                                                className="list-group-item d-flex justify-content-between align-items-center"
                                                style={{ borderRadius: 14, marginBottom: 6, boxShadow: "0 1px 4px #1677ff09" }}
                                            >
                                                <span>
                                                    <b>{lesson.name}</b>
                                                    {lesson.isFree && (
                                                        <button
                                                            className="btn btn-sm btn-outline-success rounded-pill ms-2 fw-bold px-3"
                                                            onClick={() => handlePreview(lesson)}
                                                        >
                                                            Xem thử
                                                        </button>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Card */}
                    <div
                        className="mb-4 d-flex flex-column align-items-center"
                        style={{
                            minWidth: 340,
                            background: "#fff",
                            borderRadius: 28,
                            boxShadow: "0 6px 36px #00306e18",
                            padding: "32px 22px",
                            maxWidth: 400
                        }}
                    >
                        {renderReviewBlock()}
                    </div>

                    {/* Sidebar enroll Card */}
                    <div className="d-flex flex-column align-items-center flex-fill" style={{ minWidth: 340 }}>
                        <div
                            className="card"
                            style={{
                                width: 330,
                                marginBottom: 24,
                                borderRadius: 24,
                                boxShadow: "0 4px 24px #1677ff11",
                                border: "none"
                            }}
                        >
                            <div className="card-body">
                                <h5 className="card-title text-center" style={{ fontWeight: 800, color: "#1677ff" }}>Enroll in this Course</h5>
                                <div className="h4 text-center mb-3" style={{ color: "#282f3e", fontWeight: 700 }}>
                                    {course.price?.toLocaleString()} USD
                                </div>
                                {(role === "student" || !role) && (
                                    <div className="d-grid gap-2 mb-2">
                                        <Button
                                            onClick={handleAddToCart}
                                            style={{
                                                background: "#FFC107",
                                                color: "#222",
                                                fontWeight: "bold",
                                                border: "none",
                                                width: "100%",
                                                opacity: isBought ? 0.6 : 1,
                                                cursor: isBought ? "not-allowed" : "pointer",
                                                borderRadius: 16,
                                                fontSize: 17
                                            }}
                                            className="mb-2 py-2"
                                            disabled={isBought || loadingBought}
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            variant="primary"
                                            style={{
                                                fontWeight: "bold",
                                                width: "100%",
                                                opacity: isBought ? 0.6 : 1,
                                                cursor: isBought ? "not-allowed" : "pointer",
                                                borderRadius: 16,
                                                fontSize: 17
                                            }}
                                            className="py-2"
                                            onClick={handleBuyNow}
                                            disabled={isBought || loadingBought}
                                        >
                                            Buy Now
                                        </Button>
                                        {isBought && (
                                            <div style={{ color: "green", textAlign: "center", fontWeight: "bold" }}>
                                                Bạn đã mua khóa học này!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div
                            className="card"
                            style={{
                                width: 330,
                                borderRadius: 18,
                                boxShadow: "0 2px 12px #49c6e522",
                                border: "none"
                            }}
                        >
                            <div className="card-body" style={{ color: "#282f3e", fontWeight: 600 }}>
                                <b>Instructor:</b> {course.instructorName}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal thông báo */}
                <Modal show={showNotify} onHide={() => setShowNotify(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Thông báo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {notifyMsg}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => setShowNotify(false)}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal xem thử */}
                {previewLesson && (
                    <Modal show={!!previewLesson} onHide={handleClosePreview} size="lg" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Xem thử: {previewLesson.name}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {previewLesson.description && (
                                <div style={{ marginBottom: 12 }}>
                                    <b>Mô tả bài học:</b>
                                    <div style={{ whiteSpace: 'pre-line', color: "#444" }}>
                                        {previewLesson.description}
                                    </div>
                                    <hr />
                                </div>
                            )}
                            {previewLesson.resourceUrl ? (
                                <>
                                    {isVideo(previewLesson.resourceUrl) ? (
                                        <video src={previewLesson.resourceUrl} controls width="100%" />
                                    ) : isImage(previewLesson.resourceUrl) ? (
                                        <img src={previewLesson.resourceUrl} alt="Preview" style={{ maxWidth: '100%' }} />
                                    ) : isPdf(previewLesson.resourceUrl) ? (
                                        <iframe src={previewLesson.resourceUrl} title="PDF Preview" width="100%" height="500px" />
                                    ) : (
                                        <a href={previewLesson.resourceUrl} target="_blank" rel="noopener noreferrer">
                                            Download/View File
                                        </a>
                                    )}
                                </>
                            ) : (
                                <div>Không có file xem thử.</div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClosePreview}>Đóng</Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default CourseDetailPage;
