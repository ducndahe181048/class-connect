import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaPlus, FaArrowLeft } from 'react-icons/fa';
import '../../css/Classes/ClassesHeader.css';

const ClassesHeader = ({ role, handleAddClass, handleEnrollClass }) => {
    return (
        <>
            <div className="classes-header">
                <div className="classes-title">
                    <h1><FaBook className="header-icon" /> Quản lý Lớp học</h1>
                    <p>Danh sách các lớp học của bạn</p>
                </div>
                <div className="classes-actions">
                    {role === "teacher" && (
                        <button className="btn-add-class" onClick={handleAddClass}>
                            <FaPlus /> Thêm Lớp học
                        </button>
                    )}
                    {role === "student" && (
                        <button className="btn-add-class" onClick={handleEnrollClass}>
                            <FaPlus /> Tham gia Lớp học
                        </button>
                    )}
                </div>
            </div>
            <div className="classes-navigation">
                <Link to="/dashboard" className="back-link">
                    <FaArrowLeft /> Quay lại
                </Link>
            </div>
        </>
    );
};

export default ClassesHeader;