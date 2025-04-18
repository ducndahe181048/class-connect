import React from 'react';
import { FaPlus } from 'react-icons/fa';
import '../../css/Upload/Header.css';

const Header = ({ role, onAddDocument }) => {
    return (
        <div className="upload-header">
            <div className="header-left">
                <h1>{role === "teacher" ? "Quản lý Tài liệu học tập" : "Tài liệu học tập"}</h1>
            </div>
            {role === "teacher" && (
                <button className="add-document-btn" onClick={onAddDocument}>
                    <FaPlus /> Thêm tài liệu mới
                </button>
            )}
        </div>
    );
};

export default Header;