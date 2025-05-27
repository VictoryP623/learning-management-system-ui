import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import { jwtDecode } from "jwt-decode";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FaUser } from 'react-icons/fa';

const Course = ({
    courses,
    emptyText = "Chưa có khóa học nào.",
    currentRole,
}) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    let role = currentRole;
    if (!role) {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                const decoded = jwtDecode(accessToken);
                role = decoded.role?.toLowerCase() || null;
            } catch (err) {
                role = null;
            }
        }
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="text-center" style={{ minHeight: 180, padding: 36, color: "#888", fontWeight: 500 }}>
                <img src="/empty-cart.png" alt="" width={80} style={{ opacity: 0.8, marginBottom: 10 }} />
                <div>{emptyText}</div>
            </div>
        );
    }

    const getButtonLabel = (role) => {
        if (!role || role === "student") return "Learn More";
        return "See More";
    };

    const handleButtonClick = (courseId) => {
        if (!role) {
            setShowModal(true);
        } else {
            navigate(`/course/${courseId}`);
        }
    };

    return (
        <>
            <div className="row" style={{ gap: 0, justifyContent: "center" }}>
                {courses.map(course => (
                    <div
                        key={course.id}
                        className="col-sm-12 col-md-6 col-lg-4 mb-4"
                        style={{ display: "flex", justifyContent: "center" }}
                    >
                        <div
                            className="course-card h-100"
                            style={{
                                width: 335,
                                background: "#fff",
                                borderRadius: 18,
                                boxShadow: "0 4px 24px #00306e13",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                position: "relative",
                                transition: "transform 0.18s, box-shadow 0.2s",
                                cursor: "pointer"
                            }}
                            tabIndex={0}
                            onClick={() => handleButtonClick(course.id)}
                            onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleButtonClick(course.id)}
                            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-5px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 32px #1677ff20"; }}
                            onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px #00306e13"; }}
                        >
                            <img
                                src={course.thumbnail || "/default-course.png"}
                                className="card-img-top"
                                alt={course.name}
                                style={{
                                    objectFit: 'cover',
                                    height: 170,
                                    width: "100%",
                                    background: "#eee"
                                }}
                                onError={e => { e.target.onerror = null; e.target.src = "/default-course.png"; }}
                            />
                            <div className="card-body d-flex flex-column" style={{ padding: "18px 18px 20px 18px", flex: 1 }}>
                                <h5
                                    className="card-title fw-bold mb-2"
                                    style={{
                                        color: "#1566c2",
                                        fontSize: 19,
                                        lineHeight: 1.2,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {course.name}
                                </h5>
                                <div style={{ margin: "4px 0 8px 0", minHeight: 27 }}>
                                    <Rating
                                        value={course.rating || 0}
                                        readOnly
                                        precision={0.5}
                                        size="small"
                                        sx={{ verticalAlign: "middle" }}
                                    />
                                    {course.rating > 0 && <span style={{ fontSize: 15, color: "#767676", marginLeft: 7, fontWeight: 600 }}>{course.rating.toFixed(1)}</span>}
                                </div>
                                <div style={{ color: "#5e6b85", fontSize: 15, marginBottom: 6, minHeight: 22, fontWeight: 500 }}>
                                    <FaUser style={{ color: "#1677ff", marginRight: 5 }} />
                                    {course.instructorName || "Giảng viên"}
                                </div>
                                {course.description && (
                                    <p className="card-text" style={{
                                        color: "#888",
                                        fontSize: 15,
                                        lineHeight: 1.45,
                                        marginBottom: 12,
                                        marginTop: 0,
                                        maxHeight: 56,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {course.description}
                                    </p>
                                )}
                                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontWeight: 700, color: "#1677ff", fontSize: 18 }}>
                                        {course.price ? course.price.toLocaleString() + " USD" : "Miễn phí"}
                                    </span>
                                    <button
                                        className="btn btn-primary"
                                        style={{
                                            fontWeight: 600,
                                            borderRadius: 18,
                                            fontSize: 15,
                                            padding: "5px 26px"
                                        }}
                                        onClick={e => { e.stopPropagation(); handleButtonClick(course.id); }}
                                    >
                                        {getButtonLabel(role)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Modal thông báo */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Yêu cầu đăng nhập</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn cần đăng nhập để xem chi tiết khóa học này.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={() => {
                        setShowModal(false);
                        navigate('/login');
                    }}>
                        Đăng nhập ngay
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Course;
