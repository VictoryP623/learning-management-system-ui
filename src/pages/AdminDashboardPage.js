import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getAllCourses, updateUserStatus, updateCourseStatus } from '../services/adminService';
import UserList from '../components/UserList';
import CourseList from '../components/CourseList';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token || !isAdmin(token)) {
            navigate('/login');
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const userData = await getAllUsers();
                setUsers(userData || []);
                console.log("User data:", userData);
                const courseData = await getAllCourses();
                setCourses(courseData || []);
            } catch (error) {
                setUsers([]);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const isAdmin = (token) => {
        if (!token) return false;
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            return decodedToken.role && decodedToken.role.toLowerCase() === 'admin';
        } catch (e) {
            return false;
        }
    };

    const instructors = users.filter(
        (u) => u.role && u.role.toLowerCase() === "instructor"
    );

    // Đổi status user
    const handleChangeUserStatus = async (userId, status) => {
        await updateUserStatus(userId, status);
        const userData = await getAllUsers();
        setUsers(userData || []);
    };

    // Đổi status course (giả sử CourseList cũng có select đổi status, giống user)
    const handleChangeCourseStatus = async (courseId, status) => {
        await updateCourseStatus(courseId, status);
        const courseData = await getAllCourses();
        setCourses(courseData || []);
    };

    return (
        <div className="admin-dashboard-layout">
            <aside className="admin-sidebar">
                <h2>Admin</h2>
                <ul>
                    <li>
                        <button
                            className={activeTab === 'users' ? 'active' : ''}
                            onClick={() => setActiveTab('users')}
                        >
                            User Management
                        </button>
                    </li>
                    <li>
                        <button
                            className={activeTab === 'courses' ? 'active' : ''}
                            onClick={() => setActiveTab('courses')}
                        >
                            Course Management
                        </button>
                    </li>
                </ul>
            </aside>
            <main className="admin-main-content">
                {activeTab === 'users' && (
                    <section>
                        {loading ? <div className="loading">Loading users...</div>
                            : <UserList users={users} onChangeStatus={handleChangeUserStatus} />}
                    </section>
                )}
                {activeTab === 'courses' && (
                    <section>
                        {loading ? <div className="loading">Loading courses...</div>
                            : <CourseList courses={courses} instructors={instructors} onChangeStatus={handleChangeCourseStatus} />}
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminDashboardPage;
