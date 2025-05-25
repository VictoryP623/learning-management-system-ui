import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getCoursesbyInstructor } from '../services/api';
import Course from '../components/Course';

const InstructorDetailPage = () => {
    const { instructorId } = useParams();
    const location = useLocation();
    const instructor = location.state;
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            const resCourses = await getCoursesbyInstructor(instructorId, token);
            const approvedCourses = (resCourses.data.data || []).filter(
                course => course.status === "APPROVED"
            );
            setCourses(approvedCourses);
        };
        fetchData();
    }, [instructorId]);

    if (!instructor) return <div>Loading...</div>;

    return (
        <div className="container py-5">
            <h2 className="mb-3 text-center">{instructor.fullname || instructor.name}</h2>
            <div className="mb-4 text-center">{instructor.email}</div>
            <h4 className="mb-3">Các khóa học của giảng viên</h4>
            <Course courses={courses} />
        </div>
    );
};

export default InstructorDetailPage;
