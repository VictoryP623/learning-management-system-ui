import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 6;

const SavedCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSavedCourses = async () => {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            try {
                const res = await fetch(
                    `http://localhost:8080/api/students/carts?page=${page}&limit=${PAGE_SIZE}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                const data = await res.json();
                setCourses(data?.data?.data || []);
                setTotalPages(data?.data?.totalPages || 1);
            } catch (e) {
                setCourses([]);
                setTotalPages(1);
            }
            setLoading(false);
        };
        fetchSavedCourses();
    }, [page]);

    // Modal Xoá
    const handleShowConfirm = (courseId) => {
        setCourseToDelete(courseId);
        setShowConfirm(true);
    };
    const handleConfirmDelete = async () => {
        setShowConfirm(false);
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(
                `http://localhost:8080/api/students/carts/${courseToDelete}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (res.ok) {
                setCourses(prev => prev.filter(course => course.id !== courseToDelete));
                setSelected(prev => prev.filter(id => id !== courseToDelete));
                window.dispatchEvent(new Event("cartChanged"));
            } else {
                alert("Xóa thất bại!");
            }
        } catch {
            alert("Có lỗi xảy ra!");
        }
        setCourseToDelete(null);
    };

    // Modal Thanh toán
    const handleCheckout = () => setShowCheckout(true);
    const handleConfirmCheckout = () => {
        setShowCheckout(false);
        navigate('/purchase', {
            state: {
                selectedCourses: courses.filter(course => selected.includes(course.id))
            }
        });
    };

    // Chọn/huỷ chọn 1 course
    const toggleSelect = (courseId) => {
        setSelected(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };
    // Chọn/hủy chọn tất cả
    const toggleSelectAll = () => {
        if (selected.length === courses.length) {
            setSelected([]);
        } else {
            setSelected(courses.map(course => course.id));
        }
    };
    // Tổng tiền
    const total = courses
        .filter(course => selected.includes(course.id))
        .reduce((sum, c) => sum + (c.price || 0), 0);

    // Pagination controls
    const renderPagination = () => (
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                disabled={page === 0}
                style={{ minWidth: 90, borderRadius: 16, fontWeight: 600 }}
            >
                Trang trước
            </Button>
            {[...Array(totalPages)].map((_, i) => (
                <Button
                    key={i}
                    size="sm"
                    variant={i === page ? "primary" : "outline-primary"}
                    onClick={() => setPage(i)}
                    style={{
                        minWidth: 36,
                        fontWeight: i === page ? 700 : 400,
                        borderRadius: 16
                    }}
                >
                    {i + 1}
                </Button>
            ))}
            <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={page === totalPages - 1}
                style={{ minWidth: 90, borderRadius: 16, fontWeight: 600 }}
            >
                Trang sau
            </Button>
        </div>
    );

    if (loading) return (
        <div
            style={{
                minHeight: '75vh',
                background: 'linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div className="text-center py-5" style={{ color: "#fff", fontSize: 24, fontWeight: 600 }}>
                Đang tải dữ liệu...
            </div>
        </div>
    );
    if (!courses.length) return (
        <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
                minHeight: '75vh',
                background: 'linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)',
                color: "#fff",
                fontSize: 19,
            }}
        >
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 22, marginBottom: 10 }}>
                Giỏ hàng của bạn đang trống
            </div>
            <div style={{ color: "#e3ebff", marginBottom: 26 }}>
                Hãy khám phá các khoá học hấp dẫn và lưu lại vào giỏ hàng nhé!
            </div>
            <a
                href="/courses"
                className="btn btn-warning"
                style={{
                    padding: "8px 32px",
                    fontWeight: 700,
                    fontSize: 17,
                    borderRadius: 22,
                    boxShadow: "0 2px 16px #1677ff22",
                    color: "#00306e"
                }}
            >
                Khám phá khoá học
            </a>
        </div>
    );

    return (
        <div
            style={{
                minHeight: '75vh',
                background: 'linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)',
                padding: '48px 0 32px 0',
            }}
        >
            <div
                style={{
                    background: "#fff",
                    maxWidth: 1200,
                    margin: "0 auto",
                    borderRadius: 22,
                    boxShadow: "0 8px 38px 0 #1677ff24",
                    padding: '38px 34px 30px 34px',
                }}
            >
                <h2 className="fw-bold mb-4" style={{ color: '#1677ff', textShadow: '0 2px 10px #1677ff0d' }}>Khóa học trong giỏ hàng</h2>
                <div className="mb-3 d-flex align-items-center" style={{ gap: 10 }}>
                    <input
                        type="checkbox"
                        checked={selected.length === courses.length && courses.length > 0}
                        onChange={toggleSelectAll}
                        style={{ marginRight: 4, width: 22, height: 22, accentColor: "#1677ff" }}
                    />
                    <b style={{ fontSize: 16, color: "#23262a" }}>Chọn tất cả</b>
                </div>
                <div
                    className="cart-list"
                    style={{
                        display: 'flex',
                        gap: 28,
                        flexWrap: 'wrap',
                        marginBottom: 36,
                        justifyContent: 'center'
                    }}
                >
                    {courses.map(course => (
                        <div
                            key={course.id}
                            style={{
                                border: 'none',
                                borderRadius: 18,
                                padding: 0,
                                width: 325,
                                boxShadow: '0 6px 32px 0 #00306e14',
                                position: 'relative',
                                background: "#f8faff",
                                transition: 'transform 0.18s',
                                overflow: 'hidden'
                            }}
                            className="cart-course-card"
                        >
                            <div style={{ padding: 18, paddingBottom: 0, display: "flex", alignItems: "flex-start", gap: 7 }}>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(course.id)}
                                    onChange={() => toggleSelect(course.id)}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        accentColor: "#1677ff",
                                        marginTop: 3
                                    }}
                                />
                                <div style={{ width: "100%" }}>
                                    <img src={course.thumbnail} alt="" style={{
                                        width: '100%',
                                        height: 148,
                                        objectFit: 'cover',
                                        borderRadius: 10,
                                        boxShadow: '0 3px 13px #1677ff22'
                                    }} />
                                </div>
                            </div>
                            <div style={{ padding: "12px 18px 20px 18px" }}>
                                <h4 style={{
                                    margin: '7px 0 5px',
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#1566c2"
                                }}>
                                    {course.name}
                                </h4>
                                <div style={{ color: "#606c80", fontWeight: 500, marginBottom: 3, fontSize: 15 }}>
                                    <span style={{ color: "#999", fontWeight: 400 }}>Giảng viên:</span> {course.instructorName}
                                </div>
                                <div style={{
                                    fontSize: 17,
                                    fontWeight: 700,
                                    color: "#1677ff"
                                }}>
                                    {course.price?.toLocaleString()} USD
                                </div>
                                <button
                                    onClick={() => handleShowConfirm(course.id)}
                                    className="btn btn-danger btn-sm mt-2"
                                    style={{
                                        position: 'absolute',
                                        top: 14,
                                        right: 14,
                                        borderRadius: 12,
                                        fontWeight: 600,
                                        padding: "2.5px 18px",
                                        fontSize: 15
                                    }}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Thanh toán */}
                <div
                    style={{
                        margin: "0 auto",
                        marginTop: 12,
                        marginBottom: 24,
                        maxWidth: 800,
                        background: "#eef6ff",
                        borderRadius: 16,
                        boxShadow: '0 2px 16px #1677ff0b',
                        display: "flex",
                        alignItems: "center",
                        gap: 28,
                        padding: "18px 28px"
                    }}
                >
                    <Button
                        className="btn btn-primary"
                        style={{
                            fontWeight: 700,
                            fontSize: 19,
                            opacity: selected.length ? 1 : 0.55,
                            cursor: selected.length ? 'pointer' : 'not-allowed',
                            borderRadius: 18,
                            padding: "8px 40px"
                        }}
                        disabled={selected.length === 0}
                        onClick={handleCheckout}
                    >
                        Thanh toán
                    </Button>
                    <div>
                        <b>Tổng tiền:</b>{" "}
                        <span style={{ color: "#1677ff", fontWeight: 700, fontSize: 22 }}>
                            {total.toLocaleString()} USD
                        </span>
                    </div>
                </div>
                {/* Phân trang */}
                {renderPagination()}
            </div>
            {/* Modal xác nhận xóa */}
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn xóa khóa học này khỏi giỏ hàng không?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Modal xác nhận thanh toán */}
            <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận thanh toán</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn thanh toán <b>{selected.length}</b> khóa học?<br />
                    <b>Tổng tiền: <span style={{ color: "#1677ff" }}>{total.toLocaleString()} USD</span></b>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCheckout(false)}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={handleConfirmCheckout}>
                        Thanh toán
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SavedCoursesPage;
