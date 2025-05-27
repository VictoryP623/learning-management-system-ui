import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, updateUserPassword } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaUserShield } from 'react-icons/fa';

const getUserIdFromToken = () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const decoded = jwtDecode(token);
            return decoded.id || decoded.userId || decoded.sub;
        }
    } catch (e) { }
    return null;
};

const UserProfilePage = () => {
    const userId = getUserIdFromToken();

    const [userData, setUserData] = useState({
        fullname: '',
        email: '',
        role: '',
        birthdate: '',
        address: '',
    });
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Password state
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [pwdForm, setPwdForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdError, setPwdError] = useState('');

    useEffect(() => {
        if (!userId) {
            setError("Bạn chưa đăng nhập hoặc token không hợp lệ.");
            return;
        }
        const fetchUserProfileData = async () => {
            try {
                const data = await getUserProfile();
                setUserData({
                    fullname: data.fullname || '',
                    email: data.email || '',
                    role: data.role || '',
                    birthdate: data.birthdate ? data.birthdate.slice(0, 10) : '',
                    address: data.address || '',
                });
            } catch (err) {
                setError('Không thể tải thông tin tài khoản.');
            }
        };
        fetchUserProfileData();
    }, [userId]);

    const handleChange = e => setUserData({ ...userData, [e.target.name]: e.target.value ?? '' });

    const handleEdit = () => {
        setEditMode(true);
        setSuccess('');
        setError('');
    };
    const handleCancel = () => {
        setEditMode(false);
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const submitData = {
                fullname: userData.fullname,
                birthdate: userData.birthdate ? `${userData.birthdate}T00:00:00` : null,
                address: userData.address,
            };
            await updateUserProfile(userId, submitData);
            setSuccess('Cập nhật thành công! Bạn sẽ được chuyển về trang đăng nhập...');
            setEditMode(false);

            setTimeout(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event("userChanged"));
                navigate('/login', { state: { message: "Vui lòng đăng nhập lại để cập nhật thông tin mới nhất!" } });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Cập nhật thất bại.');
        }
    };

    // ---------- PASSWORD HANDLING ----------
    const handlePwdChange = e => setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });

    const handlePwdSubmit = async e => {
        e.preventDefault();
        setPwdSuccess('');
        setPwdError('');
        if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
            setPwdError('Vui lòng điền đầy đủ các trường.');
            return;
        }
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            setPwdError('Mật khẩu mới không khớp.');
            return;
        }
        try {
            await updateUserPassword({
                oldPassword: pwdForm.oldPassword,
                newPassword: pwdForm.newPassword,
            });
            setPwdSuccess('Đổi mật khẩu thành công! Đang đăng xuất...');
            setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowPwdForm(false);

            setTimeout(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event("userChanged"));
                navigate('/login', { state: { message: "Vui lòng đăng nhập lại để tiếp tục!" } });
            }, 2000);
        } catch (err) {
            setPwdError(err?.response?.data?.error || err.message || 'Lỗi khi đổi mật khẩu.');
        }
    };

    const handlePwdFormToggle = () => {
        setShowPwdForm((show) => !show);
        setPwdSuccess('');
        setPwdError('');
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };

    if (!userId) {
        return (
            <div className="container py-5">
                <h2 className="text-center mb-4">Hồ sơ cá nhân</h2>
                <div className="alert alert-danger">Bạn chưa đăng nhập hoặc token không hợp lệ.</div>
            </div>
        );
    }

    // ---- MAIN RENDER ----
    return (
        <div
            style={{
                minHeight: "75vh",
                width: "100vw",
                background: "linear-gradient(120deg,#1677ff 0%,#49c6e5 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: "0 2px 18px #00306e18",
                    padding: "32px 28px",
                    minWidth: 350,
                    maxWidth: 430,
                    width: "100%",
                }}
            >
                {/* Avatar + Role */}
                <div className="d-flex flex-column align-items-center mb-3">
                    <div
                        style={{
                            fontWeight: 700,
                            color: "#1677ff",
                            fontSize: 20,
                            marginBottom: 0,
                            letterSpacing: 0.3,
                        }}
                    >
                        {userData.fullname}
                    </div>
                    <div style={{ color: "#777", fontSize: 15, marginTop: 1, fontWeight: 600 }}>
                        <FaUserShield size={13} style={{ marginBottom: 2, marginRight: 2 }} />
                        {userData.role}
                    </div>
                </div>
                {error && <div className="alert alert-danger text-center py-2 rounded-pill">{error}</div>}
                {success && <div className="alert alert-success text-center py-2 rounded-pill">{success}</div>}
                {/* Info */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Họ và tên</label>
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text rounded-0 border-end-0">
                                <FaUser />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                name="fullname"
                                value={userData.fullname || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text rounded-0 border-end-0">
                                <FaEnvelope />
                            </span>
                            <input
                                type="email"
                                className="form-control border-start-0"
                                value={userData.email || ""}
                                disabled
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Ngày sinh</label>
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text rounded-0 border-end-0">
                                <FaBirthdayCake />
                            </span>
                            <input
                                type="date"
                                className="form-control border-start-0"
                                name="birthdate"
                                value={userData.birthdate || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Địa chỉ</label>
                        <div className="input-group rounded-pill overflow-hidden">
                            <span className="input-group-text rounded-0 border-end-0">
                                <FaMapMarkerAlt />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                name="address"
                                value={userData.address || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>
                    </div>
                    {/* Nút action */}
                    {!editMode ? (
                        <button
                            type="button"
                            className="btn btn-primary rounded-pill"
                            onClick={handleEdit}
                            style={{
                                minWidth: 180,
                                maxWidth: 260,
                                margin: "0 auto",
                                display: "block",
                                fontWeight: 600,
                                fontSize: 16,
                            }}
                        >
                            Cập nhật thông tin
                        </button>
                    ) : (
                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-success w-100 rounded-pill"
                                style={{ fontWeight: 600, fontSize: 16 }}
                            >
                                Lưu
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary w-100 rounded-pill"
                                style={{ fontWeight: 600, fontSize: 16 }}
                                onClick={handleCancel}
                            >
                                Huỷ
                            </button>
                        </div>
                    )}
                </form>
                {/* Change password */}
                <hr className="my-4" />
                <div className="text-center mb-2">
                    <button
                        className="btn btn-warning rounded-pill"
                        style={{ fontWeight: 600, fontSize: 16, minWidth: 160 }}
                        onClick={handlePwdFormToggle}
                        type="button"
                    >
                        {showPwdForm ? "Huỷ đổi mật khẩu" : "Đổi mật khẩu"}
                    </button>
                </div>
                {pwdSuccess && (
                    <div className="alert alert-success text-center py-2 rounded-pill">{pwdSuccess}</div>
                )}
                {/* Only show password form if toggled */}
                {showPwdForm && (
                    <div>
                        <h5 className="mb-3 text-center">Đổi mật khẩu</h5>
                        {pwdError && <div className="alert alert-danger py-2 rounded-pill">{pwdError}</div>}
                        <form onSubmit={handlePwdSubmit}>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    name="oldPassword"
                                    className="form-control rounded-pill"
                                    placeholder="Mật khẩu hiện tại"
                                    value={pwdForm.oldPassword}
                                    onChange={handlePwdChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    name="newPassword"
                                    className="form-control rounded-pill"
                                    placeholder="Mật khẩu mới"
                                    value={pwdForm.newPassword}
                                    onChange={handlePwdChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control rounded-pill"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={pwdForm.confirmPassword}
                                    onChange={handlePwdChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill">
                                Cập nhật mật khẩu
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
