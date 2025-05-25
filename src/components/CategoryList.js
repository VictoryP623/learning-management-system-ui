import React from 'react';

const CategoryList = ({ categories, onEdit, onDelete }) => (
    <table className="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th colSpan={2}>Action</th>
            </tr>
        </thead>
        <tbody>
            {categories.map(category => (
                <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>
                        <button className="btn btn-warning btn-sm me-2" onClick={() => onEdit(category)}>
                            Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(category)}>
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default CategoryList;
