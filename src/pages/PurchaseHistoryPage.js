// src/pages/PurchaseHistoryPage.js
import React, { useEffect, useState } from "react";

const PurchaseHistoryPage = () => {
    const [purchases, setPurchases] = useState([]);
    useEffect(() => {
        fetch("/api/purchases")
            .then(res => res.json())
            .then(data => setPurchases(data.data || []));
    }, []);

    return (
        <div>
            <h2>Purchase History</h2>
            <ul>
                {purchases.map(p => (
                    <li key={p.id}>
                        <strong>{p.courseName}</strong> - {p.purchaseDate}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PurchaseHistoryPage;
