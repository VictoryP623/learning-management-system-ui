// src/pages/UserProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Dùng để điều hướng trang
import { getUserProfile, updateUserProfile } from '../services/api';  // Hàm gọi API

const UserProfilePage = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();  // Hook dùng để chuyển hướng

    useEffect(() => {
        // Lấy thông tin người dùng khi trang tải
        const fetchUserProfile = async () => {
            try {
                const data = await getUserProfile();
                setUser(data);  // Lưu thông tin người dùng vào state
            } catch (err) {
                setError('Error fetching user profile.');
                console.error(err);
            }
        };

        fetchUserProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Cập nhật thông tin người dùng
            const updatedData = await updateUserProfile(user);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Error updating profile.');
            console.error(err);
        }
    };

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">User Profile</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="Enter your name"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter your email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                    Update Profile
                </button>
            </form>
        </div>
    );
};

export default UserProfilePage;
