// src/services/userService.js
import { getUserProfile } from './authService';  // Import từ authService.js

// Hàm lấy thông tin người dùng
export const fetchUserProfile = async () => {
    const userProfile = await getUserProfile();
    return userProfile;
};
