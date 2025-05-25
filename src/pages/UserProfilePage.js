import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, updateUserPassword } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

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

    // --- Password state ---
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
                    birthdate: data.birthdate
                        ? data.birthdate.slice(0, 10)
                        : '',
                    address: data.address || '',
                });
            } catch (err) {
                setError('Error fetching user profile.');
            }
        };
        fetchUserProfileData();
    }, [userId]);

    const handleChange = e => {
        setUserData({ ...userData, [e.target.name]: e.target.value ?? '' });
    };

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
                birthdate: userData.birthdate
                    ? `${userData.birthdate}T00:00:00`
                    : null,
                address: userData.address,
            };
            await updateUserProfile(userId, submitData);

            setSuccess('Profile updated successfully! Bạn sẽ được chuyển về trang đăng nhập trong giây lát...');

            setEditMode(false);

            setTimeout(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event("userChanged"));
                navigate('/login', { state: { message: "Vui lòng đăng nhập lại để cập nhật thông tin mới nhất!" } });
            }, 3000); // 3s
        } catch (err) {
            setError(err.message || 'Error updating profile.');
        }
    };

    // ---------- PASSWORD HANDLING ----------
    const handlePwdChange = e => {
        setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });
    };

    const handlePwdSubmit = async e => {
        e.preventDefault();
        setPwdSuccess('');
        setPwdError('');
        if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
            setPwdError('Please fill in all password fields.');
            return;
        }
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            setPwdError('New passwords do not match.');
            return;
        }
        try {
            await updateUserPassword({
                oldPassword: pwdForm.oldPassword,
                newPassword: pwdForm.newPassword,
            });
            setPwdSuccess('Password updated successfully! Bạn sẽ được chuyển về trang đăng nhập trong giây lát...');
            setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowPwdForm(false);

            setTimeout(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.dispatchEvent(new Event("userChanged"));
                navigate('/login', { state: { message: "Vui lòng đăng nhập lại để tiếp tục!" } });
            }, 3000);
        } catch (err) {
            setPwdError(err?.response?.data?.error || err.message || 'Error updating password.');
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
                <h2 className="text-center mb-4">User Profile</h2>
                <div className="alert alert-danger">Bạn chưa đăng nhập hoặc token không hợp lệ.</div>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: 500 }}>
            <h2 className="text-center mb-4">User Profile</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label>Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="fullname"
                        value={userData.fullname || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                        required
                    />
                </div>
                <div className="form-group mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={userData.email || ''}
                        disabled
                    />
                </div>
                <div className="form-group mb-3">
                    <label>Role</label>
                    <input
                        type="text"
                        className="form-control"
                        value={userData.role || ''}
                        disabled
                    />
                </div>
                <div className="form-group mb-3">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        className="form-control"
                        name="birthdate"
                        value={userData.birthdate || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                    />
                </div>
                <div className="form-group mb-3">
                    <label>Address</label>
                    <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={userData.address || ''}
                        onChange={handleChange}
                        disabled={!editMode}
                    />
                </div>
                {!editMode ? (
                    <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={handleEdit}
                    >
                        Update Profile
                    </button>
                ) : (
                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-success btn-block"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-block"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>

            {/* ---------- Button show/hide password form ---------- */}
            <hr className="my-4" />
            <div className="text-center mb-2">
                <button
                    className="btn btn-warning"
                    style={{ fontWeight: 600, fontSize: 16 }}
                    onClick={handlePwdFormToggle}
                    type="button"
                >
                    {showPwdForm ? "Cancel Change Password" : "Change Password"}
                </button>
            </div>

            {pwdSuccess && (
                <div className="alert alert-success text-center" style={{ maxWidth: 400, margin: '10px auto' }}>
                    {pwdSuccess}
                </div>
            )}
            {/* Only show password form if toggled */}
            {showPwdForm && (
                <div>
                    <h5 className="mb-3 text-center">Change Password</h5>
                    {pwdError && <div className="alert alert-danger">{pwdError}</div>}
                    {pwdSuccess && <div className="alert alert-success">{pwdSuccess}</div>}
                    <form onSubmit={handlePwdSubmit}>
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                name="oldPassword"
                                className="form-control"
                                placeholder="Current Password"
                                value={pwdForm.oldPassword}
                                onChange={handlePwdChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                name="newPassword"
                                className="form-control"
                                placeholder="New Password"
                                value={pwdForm.newPassword}
                                onChange={handlePwdChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirm New Password"
                                value={pwdForm.confirmPassword}
                                onChange={handlePwdChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-warning w-100">
                            Update Password
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
