import React from 'react';
import { FaRegCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../../css/Schedule/ScheduleHeader.css';

const ScheduleHeader = ({ role }) => {
    return (
        <div>
            <div className="schedule-management-header">
                {role === 'teacher' && (
                    <h1>
                        <FaRegCalendarAlt className="header-icon" />
                        Lịch giảng dạy
                    </h1>
                )}
                {role === 'student' && (
                    <h1>
                        <FaRegCalendarAlt className="header-icon" />
                        Thời khóa biểu
                    </h1>
                )}
            </div>
            <div className="classes-navigation">
                <Link to="/dashboard" className="back-link">
                    <FaArrowLeft /> Quay lại
                </Link>
            </div>
        </div>
    );
};

export default ScheduleHeader;