import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RequireInstructor = ({ children }) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);

        const role = decoded.role?.toLowerCase();

        if (role !== "instructor") {
            return <Navigate to="/403" replace />;
        }

        return children;
    } catch (e) {
        return <Navigate to="/login" replace />;
    }
};

export default RequireInstructor;
