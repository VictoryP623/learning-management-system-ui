// src/routes.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CreateCoursePage from './pages/CreateCoursePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SavedCoursesPage from './pages/SavedCoursesPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import InstructorCoursesPage from './pages/InstructorCoursesPage';
import CourseReviewPage from './pages/CourseReviewPage';
import EditCoursePage from './pages/EditCoursePage';
import AddLessonPage from './pages/AddLessonPage';
import EditLessonPage from './pages/EditLessonPage';
import UploadLessonResource from './pages/UploadLessonResource';
import InstructorsPage from './pages/InstructorsPage';
import InstructorDetailPage from './pages/InstructorDetailPage';
import RequireStudent from './components/RequireStudent';
import PurchasePage from './pages/PurchasePage';


const RoutesConfig = () => {
    return (
        <Routes>
            {/* Chung */}
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Auth */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Student */}
            <Route path="/instructors" element={<RequireStudent><InstructorsPage /></RequireStudent>} />
            <Route path="/instructors/:instructorId" element={<RequireStudent><InstructorDetailPage /></RequireStudent>} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/saved-courses" element={<SavedCoursesPage />} />
            <Route path="/purchase-history" element={<PurchaseHistoryPage />} />
            <Route path="/purchase" element={<PurchasePage />} />

            {/* Course Review */}
            <Route path="/course/:id/reviews" element={<CourseReviewPage />} />

            {/* Instructor */}
            <Route path="/create-course" element={<CreateCoursePage />} />
            <Route path="/instructor-dashboard" element={<InstructorDashboardPage />} />
            <Route path="/instructor/course/:id" element={<InstructorCoursesPage />} />
            <Route path="/edit-course/:id" element={<EditCoursePage />} />
            <Route path="/course/:id/add-lesson" element={<AddLessonPage />} />
            <Route path="/lessons/:id/edit" element={<EditLessonPage />} />
            <Route path="/instructor/lesson/:lessonId/resource/upload" element={<UploadLessonResource />} />

            {/* Admin */}
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />

            {/* Route 404 */}
            <Route path="*" element={<h2 style={{ textAlign: 'center' }}>404 - Page Not Found</h2>} />
        </Routes>
    );
};

export default RoutesConfig;
