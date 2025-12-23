import React from "react";

export default function AssignmentStatusBadge({ status, late }) {
    let label = status;
    let bg = "#999";

    if (status === "NOT_SUBMITTED") {
        label = "Chưa nộp";
        bg = "#6c757d";
    } else if (status === "SUBMITTED") {
        label = "Đã nộp";
        bg = "#0d6efd";
    } else if (status === "GRADED") {
        label = "Đã chấm";
        bg = "#198754";
    }

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                background: bg,
                color: "#fff",
                whiteSpace: "nowrap",
            }}
        >
            {label}
            {late ? (
                <span
                    style={{
                        background: "rgba(255,255,255,0.22)",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 900,
                    }}
                >
                    Trễ hạn
                </span>
            ) : null}
        </span>
    );
}
