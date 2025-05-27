import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Spinner } from "react-bootstrap";
import { createPaypalPurchase } from "../services/api";

const PurchasePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedCourses = location.state?.selectedCourses || [];
    const total = selectedCourses.reduce((sum, c) => sum + (c.price || 0), 0);

    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const selectedIds = selectedCourses.map(c => c.id);
            const paypalRes = await createPaypalPurchase(selectedIds);
            if (paypalRes && paypalRes.payUrl) {
                window.location.href = paypalRes.payUrl;
            } else {
                alert('Không lấy được link thanh toán PayPal!');
            }
        } catch (err) {
            alert("Thanh toán thất bại: " + (err.message || "Có lỗi xảy ra!"));
        }
        setLoading(false);
    };

    if (!selectedCourses.length)
        return (
            <div
                style={{
                    minHeight: "70vh",
                    background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 32
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        padding: "42px 28px",
                        borderRadius: 18,
                        boxShadow: "0 2px 20px #00306e18",
                        maxWidth: 380,
                        width: "100%",
                        textAlign: "center"
                    }}
                >
                    <h2 style={{ color: "#1566c2", marginBottom: 20 }}>Không có khóa học nào để thanh toán!</h2>
                    <Button
                        variant="primary"
                        style={{ fontWeight: 600, borderRadius: 16, padding: "8px 28px", fontSize: 17 }}
                        onClick={() => navigate('/saved-courses')}
                    >
                        Quay lại giỏ hàng
                    </Button>
                </div>
            </div>
        );

    return (
        <div
            style={{
                minHeight: "70vh",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 0"
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 3px 28px #1677ff18",
                    padding: "44px 36px 36px 36px",
                    width: "100%",
                    maxWidth: 500
                }}
            >
                <h2
                    className="mb-4 text-center"
                    style={{
                        color: "#1566c2",
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        fontSize: 30,
                    }}
                >
                    Thanh toán khóa học
                </h2>
                <ul
                    className="list-group mb-4"
                    style={{
                        border: "none",
                        marginBottom: 30,
                        background: "transparent",
                        boxShadow: "none"
                    }}
                >
                    {selectedCourses.map(course => (
                        <li
                            key={course.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                            style={{
                                border: "none",
                                borderRadius: 14,
                                marginBottom: 8,
                                background: "#f6f9ff"
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <img
                                    src={course.thumbnail}
                                    alt=""
                                    style={{
                                        width: 54,
                                        height: 38,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        marginRight: 10,
                                        background: "#dde7fa"
                                    }}
                                />
                                <span style={{ fontWeight: 600, color: "#23262a" }}>{course.name}</span>
                            </span>
                            <span style={{ color: "#1677ff", fontWeight: 700 }}>
                                {course.price?.toLocaleString()} USD
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="mb-4 text-center" style={{ fontSize: 21 }}>
                    <b>Tổng tiền: <span style={{ color: "#1677ff", fontWeight: 800 }}>{total.toLocaleString()} USD</span></b>
                </div>
                <div className="d-flex justify-content-center gap-3">
                    <Button
                        variant="warning"
                        size="lg"
                        style={{
                            fontWeight: 800,
                            color: "#1a263a",
                            borderRadius: 18,
                            padding: "8px 38px",
                            fontSize: 16,         // <= giảm từ 20 xuống 16
                            boxShadow: "0 3px 16px #ffd90019"
                        }}
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : "Thanh toán bằng PayPal"}
                    </Button>
                    <Button
                        variant="outline-secondary"
                        size="lg"
                        style={{
                            fontWeight: 700,
                            borderRadius: 18,
                            padding: "8px 30px",
                            fontSize: 15,         // <= giảm từ 18 xuống 15
                        }}
                        onClick={() => navigate('/saved-courses')}
                    >
                        Quay lại
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PurchasePage;
