import React from 'react';

const CategoryList = ({ categories, onEdit, onDelete }) => (
    <div className="table-responsive">
        <table className="table align-middle table-hover" style={{ borderRadius: 14, overflow: "hidden" }}>
            <thead style={{ background: "#1677ff", color: "#fff" }}>
                <tr>
                    <th style={{ minWidth: 60 }}>ID</th>
                    <th>Name</th>
                    <th style={{ textAlign: "center", minWidth: 160 }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {categories.length === 0 && (
                    <tr>
                        <td colSpan={3} className="text-center text-secondary py-4">No categories found.</td>
                    </tr>
                )}
                {categories.map(category => (
                    <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td className="text-center">
                            <button
                                className="btn btn-warning btn-sm rounded-pill px-3 me-2"
                                onClick={() => onEdit(category)}
                            >Sửa</button>
                            <button
                                className="btn btn-danger btn-sm rounded-pill px-3"
                                onClick={() => onDelete(category)}
                            >Xóa</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default CategoryList;
