import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAllUsers, getAllCourses, updateUserStatus, updateCourseStatus,
    getAllCategories, addCategory, updateCategory, deleteCategory
} from '../services/adminService';
import UserList from '../components/UserList';
import CourseList from '../components/CourseList';
import CategoryList from '../components/CategoryList';
import CategoryModal from '../components/CategoryModal';

const PAGE_SIZE = 10;

function matchWordStartsWith(text, search) {
    if (!search) return true;
    if (!text) return false;
    const normalizedSearch = search.trim().toLowerCase();
    return text
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .some(word => word.startsWith(normalizedSearch));
}

const AdminDashboardPage = () => {
    // State...
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userRole, setUserRole] = useState('');
    const [courses, setCourses] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');
    const [courseInstructor, setCourseInstructor] = useState('');
    const [categories, setCategories] = useState([]);
    const [catPage, setCatPage] = useState(0);
    const [catTotalPages, setCatTotalPages] = useState(1);
    const [catSearch, setCatSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [, setModalOpen] = useState(false);
    const [, setSelectedCourse] = useState(null);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);

    const navigate = useNavigate();

    // Modal xác nhận xoá
    const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
        if (!show) return null;
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99
            }}>
                <div style={{
                    background: '#fff', borderRadius: 18, padding: 28, minWidth: 340,
                    boxShadow: '0 4px 24px #0003', textAlign: "center", position: "relative"
                }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: "#d35400", marginBottom: 10 }}>
                        {title || "Confirm"}
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        {message}
                    </div>
                    <button className="btn btn-danger me-2 rounded-pill px-4" onClick={onConfirm}>Delete</button>
                    <button className="btn btn-secondary rounded-pill px-4" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        );
    };

    // Fetch Data
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

    useEffect(() => {
        if (activeTab === 'categories') {
            fetchCategories(catPage, PAGE_SIZE, catSearch);
        }
    }, [activeTab, catPage, catSearch]);

    const fetchCategories = async (page = 0, limit = PAGE_SIZE, search = '') => {
        try {
            const data = await getAllCategories(page, limit, search);
            setCategories(data.data || []);
            setCatTotalPages(data.totalPages || 1);
        } catch (err) {
            setCategories([]);
            setCatTotalPages(1);
        }
    };

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

    // User
    const handleChangeUserStatus = async (userId, status) => {
        await updateUserStatus(userId, status);
        const userData = await getAllUsers();
        setUsers(userData || []);
    };

    // Course
    const handleChangeCourseStatus = async (courseId, status, rejectedReason) => {
        await updateCourseStatus(courseId, status, rejectedReason);
        const courseData = await getAllCourses();
        setCourses(courseData || []);
        const course = (courseData || []).find(c => c.id === courseId);
        if (status === "REJECTED") {
            setSelectedCourse({ ...course, rejectedReason });
            setModalOpen(true);
        }
    };

    // Category CRUD
    const handleAddCategory = () => {
        setEditingCategory(null);
        setCategoryModalOpen(true);
    };
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryModalOpen(true);
    };
    const handleDeleteCategory = (category) => {
        setPendingDeleteCategory(category);
        setConfirmOpen(true);
    };
    const confirmDeleteCategory = async () => {
        if (pendingDeleteCategory) {
            try {
                await deleteCategory(pendingDeleteCategory.id);
                fetchCategories(catPage, PAGE_SIZE, catSearch);
            } catch (err) {
                alert(err.message);
            }
            setConfirmOpen(false);
            setPendingDeleteCategory(null);
        }
    };
    const handleSubmitCategory = async (name) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, { name });
            } else {
                await addCategory({ name });
            }
            setCategoryModalOpen(false);
            fetchCategories(catPage, PAGE_SIZE, catSearch);
        } catch (err) {
            alert(err.message);
        }
    };

    // Filter
    const roles = [
        { label: "All", value: "" },
        { label: "Admin", value: "Admin" },
        { label: "Instructor", value: "Instructor" },
        { label: "Student", value: "Student" },
    ];
    const filteredUsers = users.filter(u => {
        if (userRole && (!u.role || u.role.toLowerCase() !== userRole.toLowerCase())) return false;
        return matchWordStartsWith(u.fullname || u.name || '', userSearch);
    });
    const filteredCourses = courses.filter(c => {
        if (courseInstructor && c.instructorName !== courseInstructor) return false;
        return matchWordStartsWith(c.name || '', courseSearch);
    });

    return (
        <div className="admin-dashboard-layout">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <h2>ADMIN management</h2>
                <ul>
                    <li>
                        <button
                            className={activeTab === 'users' ? 'active' : ''}
                            onClick={() => setActiveTab('users')}
                        >
                            User
                        </button>
                    </li>
                    <li>
                        <button
                            className={activeTab === 'courses' ? 'active' : ''}
                            onClick={() => setActiveTab('courses')}
                        >
                            Course
                        </button>
                    </li>
                    <li>
                        <button
                            className={activeTab === 'categories' ? 'active' : ''}
                            onClick={() => setActiveTab('categories')}
                        >
                            Category
                        </button>
                    </li>
                </ul>
            </aside>
            {/* MAIN CONTENT */}
            <main className="admin-main-content">
                {activeTab === 'users' && (
                    <section>
                        <div className="d-flex mb-3 align-items-center" style={{ gap: 20 }}>
                            <label
                                htmlFor="role-filter"
                                style={{
                                    fontWeight: 700,
                                    color: "#1677ff",
                                    marginRight: 6,
                                    fontSize: 16,
                                    letterSpacing: 0.2,
                                    minWidth: 62
                                }}
                            >
                                Role:
                            </label>
                            <select
                                id="role-filter"
                                value={userRole}
                                onChange={e => setUserRole(e.target.value)}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: 24,
                                    border: "1.7px solid #1677ff",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 135,
                                    background: "#fff"
                                }}
                            >
                                {roles.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <input
                                className="form-control"
                                style={{
                                    maxWidth: 270,
                                    borderRadius: 24,
                                    border: "1.7px solid #1677ff",
                                    fontSize: 15,
                                    boxShadow: "none",
                                    padding: "7px 17px"
                                }}
                                placeholder="Search user (word starts with)..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                            />
                        </div>
                        {loading ? <div className="loading">Loading users...</div>
                            : <UserList users={filteredUsers} onChangeStatus={handleChangeUserStatus} />}
                    </section>
                )}
                {activeTab === 'courses' && (
                    <section>
                        <div className="d-flex mb-3 align-items-center" style={{ gap: 20 }}>
                            <label
                                htmlFor="instructor-filter"
                                style={{
                                    fontWeight: 700,
                                    color: "#1677ff",
                                    marginRight: 6,
                                    fontSize: 16,
                                    letterSpacing: 0.2,
                                    minWidth: 93
                                }}
                            >
                                Instructor:
                            </label>
                            <select
                                id="instructor-filter"
                                value={courseInstructor}
                                onChange={e => setCourseInstructor(e.target.value)}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: 24,
                                    border: "1.7px solid #1677ff",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 135,
                                    background: "#fff"
                                }}
                            >
                                <option value="">All</option>
                                {instructors.map(inst => (
                                    <option key={inst.id} value={inst.fullname || inst.name}>
                                        {inst.fullname || inst.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                className="form-control"
                                style={{
                                    maxWidth: 270,
                                    borderRadius: 24,
                                    border: "1.7px solid #1677ff",
                                    fontSize: 15,
                                    boxShadow: "none",
                                    padding: "7px 17px"
                                }}
                                placeholder="Search course (word starts with)..."
                                value={courseSearch}
                                onChange={e => setCourseSearch(e.target.value)}
                            />
                        </div>
                        {loading ? <div className="loading">Loading courses...</div>
                            : <CourseList courses={filteredCourses} instructors={instructors} onChangeStatus={handleChangeCourseStatus} />}
                    </section>
                )}
                {activeTab === 'categories' && (
                    <section>
                        <div className="d-flex mb-3 align-items-center" style={{ gap: 20 }}>
                            <button className="btn btn-success me-2" style={{ borderRadius: 24, fontWeight: 600, padding: "7px 24px" }} onClick={handleAddCategory}>Add Category</button>
                            <input
                                className="form-control"
                                style={{
                                    maxWidth: 270,
                                    borderRadius: 24,
                                    border: "1.7px solid #1677ff",
                                    fontSize: 15,
                                    boxShadow: "none",
                                    padding: "7px 17px"
                                }}
                                placeholder="Search category (word starts with)..."
                                value={catSearch}
                                onChange={e => { setCatSearch(e.target.value); setCatPage(0); }}
                            />
                        </div>
                        <CategoryList
                            categories={categories}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                        />
                        {/* Pagination */}
                        <nav>
                            <ul className="pagination">
                                {[...Array(catTotalPages)].map((_, idx) => (
                                    <li key={idx} className={`page-item ${catPage === idx ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCatPage(idx)}>{idx + 1}</button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <CategoryModal
                            show={categoryModalOpen}
                            onClose={() => setCategoryModalOpen(false)}
                            onSubmit={handleSubmitCategory}
                            initialData={editingCategory}
                        />
                    </section>
                )}
            </main>
            {/* ... ConfirmModal ... */}
            <ConfirmModal
                show={confirmOpen}
                title="Xác nhận xóa"
                message={pendingDeleteCategory
                    ? `Bạn có chắc muốn xóa category: ${pendingDeleteCategory.name}?`
                    : ""}
                onConfirm={confirmDeleteCategory}
                onCancel={() => { setConfirmOpen(false); setPendingDeleteCategory(null); }}
            />
        </div>
    );
};

export default AdminDashboardPage;
