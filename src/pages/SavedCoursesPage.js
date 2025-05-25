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

    // Lấy giỏ hàng với phân trang
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
            // Gửi đúng endpoint và truyền đúng id
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
            } else {
                alert("Xóa thất bại!");
            }
        } catch {
            alert("Có lỗi xảy ra!");
        }
        setCourseToDelete(null);
    };

    // Modal Thanh toán
    const handleCheckout = () => {
        setShowCheckout(true);
    };
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
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                disabled={page === 0}
            >
                Trang trước
            </Button>
            {[...Array(totalPages)].map((_, i) => (
                <Button
                    key={i}
                    size="sm"
                    variant={i === page ? "primary" : "outline-primary"}
                    onClick={() => setPage(i)}
                    style={{ minWidth: 36, fontWeight: i === page ? 700 : 400 }}
                >
                    {i + 1}
                </Button>
            ))}
            <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={page === totalPages - 1}
            >
                Trang sau
            </Button>
        </div>
    );

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (!courses.length) return <div>Bạn chưa có khóa học nào trong giỏ hàng!</div>;

    return (
        <div style={{ padding: 32 }}>
            <h2>Khóa học đã lưu trong giỏ hàng</h2>
            <div className="mb-3">
                <input
                    type="checkbox"
                    checked={selected.length === courses.length && courses.length > 0}
                    onChange={toggleSelectAll}
                    style={{ marginRight: 8 }}
                />
                <b>Chọn tất cả</b>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {courses.map(course => (
                    <div
                        key={course.id}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            padding: 16,
                            width: 300,
                            boxShadow: '0 2px 8px #eee',
                            position: 'relative'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(course.id)}
                            onChange={() => toggleSelect(course.id)}
                            style={{ position: 'absolute', top: 12, left: 12, zoom: 1.4 }}
                        />
                        <img src={course.thumbnail} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
                        <h4 style={{ margin: '12px 0 6px' }}>{course.name}</h4>
                        <div>Giá: <b>{course.price?.toLocaleString()} VND</b></div>
                        <div>Giảng viên: {course.instructorName}</div>
                        <button
                            onClick={() => handleShowConfirm(course.id)}
                            className="btn btn-danger btn-sm mt-2"
                            style={{ position: 'absolute', top: 12, right: 12 }}
                        >
                            Xóa
                        </button>
                    </div>
                ))}
            </div>
            {/* Thanh toán */}
            <div style={{
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 24
            }}>
                <Button
                    className="btn btn-primary"
                    style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        opacity: selected.length ? 1 : 0.6,
                        cursor: selected.length ? 'pointer' : 'not-allowed'
                    }}
                    disabled={selected.length === 0}
                    onClick={handleCheckout}
                >
                    Thanh toán
                </Button>
                <div>
                    <b>Tổng tiền:</b>{" "}
                    <span style={{ color: "#1677ff", fontWeight: 700, fontSize: 18 }}>
                        {total.toLocaleString()} VND
                    </span>
                </div>
            </div>
            {/* Phân trang */}
            {renderPagination()}

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
                    <b>Tổng tiền: <span style={{ color: "#1677ff" }}>{total.toLocaleString()} VND</span></b>
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
