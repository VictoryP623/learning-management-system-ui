import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseDetail } from '../services/api';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const CourseDetailPage = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [showLessons, setShowLessons] = useState(false);
    const [previewLesson, setPreviewLesson] = useState(null);

    // State cho modal thông báo
    const [showNotify, setShowNotify] = useState(false);
    const [notifyMsg, setNotifyMsg] = useState('');

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

    if (!course) return <div>Loading...</div>;
    if (course.status !== "APPROVED")
        return <div style={{ color: 'red', textAlign: 'center', marginTop: 30 }}>Khóa học chưa khả dụng hoặc đã bị từ chối.</div>;

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

    return (
        <div className="container py-5">
            <div className="row">
                {/* Main content */}
                <div className="col-md-8">
                    <h2 className="mb-3">{course.name}</h2>
                    <img src={course.thumbnail} alt={course.name} className="img-fluid mb-3" style={{ maxHeight: 320 }} />
                    {course.description && (
                        <>
                            <h4 className="mt-3">Course Description</h4>
                            <p>{course.description}</p>
                        </>
                    )}

                    <div className="mt-4">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setShowLessons(v => !v)}
                        >
                            {showLessons ? "Ẩn nội dung khóa học" : "Xem thêm nội dung khóa học"}
                        </button>
                        {showLessons && Array.isArray(course.lessons) && course.lessons.length > 0 && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <h5 className="mb-0">Nội dung khóa học:</h5>
                                    <small>{course.lessons.length} bài học</small>
                                </div>
                                <ul className="list-group mt-2">
                                    {course.lessons.map(lesson => (
                                        <li
                                            key={lesson.id}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <span>
                                                <b>{lesson.name}</b>
                                                {lesson.isFree && lesson.resourceUrl && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success ms-2"
                                                        onClick={() => handlePreview(lesson)}
                                                    >
                                                        Xem thử
                                                    </button>
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    {/* Student reviews */}
                    {Array.isArray(course.reviews) && course.reviews.length > 0 && (
                        <>
                            <h4 className="mt-4">Student Reviews</h4>
                            {course.reviews.map(review => (
                                <div key={review.id} className="mb-2">
                                    <b>{review.studentName}</b>: {review.content}
                                </div>
                            ))}
                        </>
                    )}
                </div>
                {/* Sidebar */}
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title text-center">Enroll in this Course</h5>
                            <div className="h4 text-center mb-3">{course.price?.toLocaleString()} VND</div>
                            <div className="d-grid gap-2 mb-2">
                                <Button
                                    onClick={handleAddToCart}
                                    style={{
                                        background: "#FFC107",
                                        color: "#222",
                                        fontWeight: "bold",
                                        border: "none",
                                        width: "100%",
                                    }}
                                    className="mb-2"
                                >
                                    Add to Cart
                                </Button>

                                <Button
                                    variant="primary"
                                    style={{ fontWeight: "bold", width: "100%" }}
                                >
                                    Buy Now
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="card mt-3">
                        <div className="card-body">
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
    );
};

export default CourseDetailPage;
