import React from 'react'
import { FaClipboardList, FaPlus } from 'react-icons/fa';
import '../../css/TeacherAssignment/Header.css';

const Header = ({ onCreateNewAssignment }) => {
    return (
        <div className="assignments-header">
            <div className="header-title">
                <FaClipboardList className="header-icon" />
                <h1>Quản lý Bài tập</h1>
            </div>

            <button className="create-btn" onClick={onCreateNewAssignment}>
                <FaPlus /> Tạo Bài tập mới
            </button>
        </div>
    )
}

export default Header