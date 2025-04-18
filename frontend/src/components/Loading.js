import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../css/Loading.css';

function Loading() {
    return (
        <div className="classes-container">
            <div className="loading-container">
                <FaSpinner className="loading-icon" />
                <p>Đang tải dữ liệu ...</p>
            </div>
        </div>
    )
}

export default Loading