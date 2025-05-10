// src/components/Hero.js
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="hero bg-primary text-white text-center py-5">
            <div className="container">
                <h1 className="display-4">Learn From The Best</h1>
                <p className="lead">Start your learning journey with us today!</p>
                <Link to="/signup" className="btn btn-light btn-lg">Get Started</Link>
                <Link to="/courses" className="btn btn-outline-light btn-lg ml-3">Browse Courses</Link>
            </div>
        </section>
    );
};

export default Hero;
