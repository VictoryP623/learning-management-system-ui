import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/api';
import { jwtDecode } from 'jwt-decode';

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

    useEffect(() => {
        if (!userId) {
            setError("Bạn chưa đăng nhập hoặc token không hợp lệ.");
            return;
        }
        const fetchUserProfileData = async () => {
            try {
                const data = await getUserProfile();
                // data.birthdate có thể là "YYYY-MM-DDTHH:mm:ss" hoặc chỉ "YYYY-MM-DD"
                // Chỉ lấy phần ngày để hiện lên input type="date"
                setUserData({
                    fullname: data.fullname || '',
                    email: data.email || '',
                    role: data.role || '',
                    birthdate: data.birthdate
                        ? data.birthdate.slice(0, 10)
                        : '', // Chỉ lấy YYYY-MM-DD
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
            // Chuyển birthdate về dạng LocalDateTime (YYYY-MM-DDT00:00:00)
            const submitData = {
                fullname: userData.fullname,
                birthdate: userData.birthdate
                    ? `${userData.birthdate}T00:00:00`
                    : null, // null hoặc "" nếu rỗng
                address: userData.address,
            };
            console.log('Submit data:', submitData);
            await updateUserProfile(userId, submitData);
            setSuccess('Profile updated successfully!');
            setEditMode(false);
        } catch (err) {
            setError(err.message || 'Error updating profile.');
        }
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
        <div className="container py-5">
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
        </div>
    );
};

export default UserProfilePage;
