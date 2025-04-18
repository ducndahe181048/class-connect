import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaArrowLeft } from 'react-icons/fa';
import '../../css/ClassDetail/ClassHeader.css';

const ClassHeader = ({ classData }) => {
    return (
        <div className="class-detail-header">
            <h1>
                <FaBook className="header-icon" />
                {classData.name}
            </h1>
            <Link to="/classes" className="back-to-classes-btn">
                <FaArrowLeft /> Quay lại danh sách lớp học
            </Link>
        </div>
    );
};

export default ClassHeader;