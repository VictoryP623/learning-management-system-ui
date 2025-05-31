import React, { useEffect, useState } from 'react';
import { getCourses } from '../services/api';
import { getAllCategories } from '../services/adminService'; // Sửa đường dẫn nếu khác
import Course from '../components/Course';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    // Lấy khóa học
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses({ page: 0, limit: 99 });
                setCourses(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Lấy danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getAllCategories(0, 99, '');
                setCategories(res.data || []);
            } catch (e) {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Lọc course theo category đã chọn
    const filteredCourses = selectedCategory === 'all'
        ? courses
        : courses.filter(course =>
            String(course.categoryId) === String(selectedCategory) ||
            (course.category && String(course.category.id) === String(selectedCategory))
        );

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{
            minHeight: '75vh',
            width: "100vw",
            background: 'linear-gradient(90deg,#1677ff 0%,#49c6e5 100%)'
        }}>
            <div className="container py-5" style={{ minHeight: "75vh" }}>
                <h2 className="text-center mb-4" style={{ color: "#EEEE00", fontWeight: 700 }}>Courses</h2>

                <div className="mb-4 d-flex justify-content-end">
                    <select
                        className="form-select"
                        style={{ width: 220, fontSize: 16 }}
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <Course courses={filteredCourses} emptyText="No courses found." />
            </div>
        </div>
    );
};

export default CoursesPage;
