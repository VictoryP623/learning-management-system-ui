import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Spinner } from "react-bootstrap";
import { createPurchase } from "../services/api";

const PurchasePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedCourses = location.state?.selectedCourses || [];
    const total = selectedCourses.reduce((sum, c) => sum + (c.price || 0), 0);

    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const momoRes = await createPurchase();
            // Lấy link thanh toán
            if (momoRes && momoRes.payUrl) {
                window.location.href = momoRes.payUrl;
            } else {
                alert('Không lấy được link thanh toán!');
            }
        } catch (err) {
            alert("Thanh toán thất bại: " + err.message);
        }
        setLoading(false);
    };

    if (!selectedCourses.length)
        return (
            <div style={{ padding: 32, textAlign: 'center' }}>
                <h2>Không có khóa học nào để thanh toán!</h2>
                <Button onClick={() => navigate('/saved-courses')}>Quay lại giỏ hàng</Button>
            </div>
        );

    return (
        <div style={{ padding: 32, maxWidth: 600, margin: "auto" }}>
            <h2>Thanh toán khóa học</h2>
            <ul className="list-group mb-4">
                {selectedCourses.map(course => (
                    <li key={course.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            <img src={course.thumbnail} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 12 }} />
                            {course.name}
                        </span>
                        <span>{course.price?.toLocaleString()} VND</span>
                    </li>
                ))}
            </ul>
            <div className="mb-3" style={{ fontSize: 20 }}>
                <b>Tổng tiền: <span style={{ color: "#1677ff" }}>{total.toLocaleString()} VND</span></b>
            </div>
            <Button
                variant="success"
                size="lg"
                style={{ fontWeight: 700 }}
                onClick={handlePayment}
                disabled={loading}
            >
                {loading ? <Spinner animation="border" size="sm" /> : "Xác nhận thanh toán"}
            </Button>
            <Button variant="secondary" className="ms-3" onClick={() => navigate('/saved-courses')}>
                Quay lại giỏ hàng
            </Button>
        </div>
    );
};

export default PurchasePage;
