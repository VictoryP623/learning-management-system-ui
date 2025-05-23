import React, { useEffect, useState } from 'react';
import { getStudentPurchasedCourses } from '../services/api';

function MyCoursePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        getStudentPurchasedCourses(token)
            .then(res => {
                setCourses(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                setError('Không lấy được danh sách khóa học đã mua');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Các khóa học của tôi (Student)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tên khóa học</th>
                        <th>Giá</th>
                        <th>Ngày mua</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.length === 0 && (
                        <tr><td colSpan={3}>Chưa mua khóa học nào.</td></tr>
                    )}
                    {courses.map((course) => (
                        <tr key={course.id}>
                            <td>{course.name}</td>
                            <td>{course.price}</td>
                            <td>{course.createdAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MyCoursePage;
