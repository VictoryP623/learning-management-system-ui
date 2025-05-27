import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const PaypalSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending"); // "pending" | "success" | "fail"
  const [modal, setModal] = useState({ show: false, title: '', message: '', next: null });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentId = params.get("paymentId");
    const payerId = params.get("PayerID");
    const purchaseId = params.get("purchaseId");
    const token = localStorage.getItem('accessToken');

    if (!paymentId || !payerId || !purchaseId) {
      setStatus("fail");
      setModal({
        show: true,
        title: "Lỗi thanh toán",
        message: "Thanh toán không hợp lệ!",
        next: () => navigate("/")
      });
      return;
    }

    axios.post(
      "http://localhost:8080/api/purchases/paypal/execute",
      { paymentId, payerId, purchaseId },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setStatus("success");
        setModal({
          show: true,
          title: "Thành công",
          message: "Thanh toán thành công!",
          next: () => navigate("/my-courses")
        });
        // Nếu muốn tự động chuyển trang sau vài giây, có thể setTimeout ở đây.
        // setTimeout(() => navigate("/my-courses"), 1200);
      })
      .catch((err) => {
        setStatus("fail");
        setModal({
          show: true,
          title: "Lỗi xác nhận",
          message: "Xác nhận thanh toán thất bại!",
          next: () => navigate("/")
        });
        console.error(err);
        // setTimeout(() => navigate("/"), 1500);
      });
  }, [location, navigate]);

  const handleModalClose = () => {
    setModal({ ...modal, show: false });
    if (status === "success") {
      window.dispatchEvent(new Event("cartChanged"));
    }
    if (modal.next) modal.next();
  };

  // Biểu tượng trạng thái
  const renderStatusIcon = () => {
    if (status === "pending") return <FaSpinner className="spin" size={52} color="#1677ff" style={{ marginBottom: 16 }} />;
    if (status === "success") return <FaCheckCircle size={54} color="#1dd179" style={{ marginBottom: 16 }} />;
    if (status === "fail") return <FaTimesCircle size={54} color="#e23a3a" style={{ marginBottom: 16 }} />;
    return null;
  };

  // Nội dung trạng thái
  const statusText = {
    pending: "Đang xác nhận thanh toán...",
    success: "Thanh toán thành công! Đang chuyển hướng...",
    fail: "Thanh toán thất bại. Đang chuyển hướng..."
  };

  return (
    <div
      style={{
        minHeight: "75vh",
        background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "52px 38px 38px 38px",
          minWidth: 340,
          maxWidth: 420,
          boxShadow: "0 3px 24px #1677ff16",
          textAlign: "center"
        }}
      >
        <div className="mb-3">{renderStatusIcon()}</div>
        <div style={{
          fontWeight: 700,
          fontSize: 22,
          marginBottom: 10,
          color: status === "success"
            ? "#1dd179"
            : (status === "fail" ? "#e23a3a" : "#1677ff")
        }}>
          {status === "success"
            ? "Thanh toán thành công!"
            : status === "fail"
              ? "Thanh toán thất bại"
              : "Đang xác nhận..."}
        </div>
        <div style={{ color: "#65789c", fontSize: 17, marginBottom: 15 }}>
          {statusText[status]}
        </div>
        {status === "pending" && (
          <Spinner animation="border" variant="primary" />
        )}
      </div>

      {/* Modal thông báo */}
      <Modal show={modal.show} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modal.message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Spinner animation css */}
      <style>
        {`
          .spin {
            animation: spin 1.1s linear infinite;
            display: inline-block;
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PaypalSuccessPage;
