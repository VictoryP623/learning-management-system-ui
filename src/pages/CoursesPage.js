import React, { useEffect, useState } from 'react';
import { getCourses } from '../services/api';
import Course from '../components/Course';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses({ page: 0, limit: 99 });
                setCourses(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container py-5">
            <h2 className="text-center mb-4">Courses</h2>
            <Course courses={courses} emptyText="No courses found." />
        </div>
    );
};

export default CoursesPage;
