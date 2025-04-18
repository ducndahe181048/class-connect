import React from 'react';
import { FaIdCard, FaBook, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import '../../css/ClassDetail/ClassInfoCard.css';

const ClassInfoCard = ({ classData, role }) => {
    return (
        <div className="class-detail-card">
            <div className="class-detail-card-header">
                <h2>Thông tin lớp học</h2>
            </div>
            <div className="class-detail-card-body">
                <p style={{ fontWeight: "bold" }}>
                    <FaIdCard /> Mã lớp học: {classData._id}
                </p>
                <p>
                    <FaBook /> Mô tả: {classData.description || "Chưa cập nhật"}
                </p>
                {role === "teacher" && (
                    <p>
                        <FaUsers /> Số học viên: {classData.numberOfStudents || 0}
                    </p>
                )}
                {role === "student" && (
                    <p>
                        <FaUsers /> Giảng viên: {classData.userId?.fullname || "N/A"}
                    </p>
                )}
                <p>
                    <FaCalendarAlt /> Ngày bắt đầu: {new Date(classData.startDate).toLocaleDateString('vi-VN')}
                </p>
            </div>
        </div>
    );
};

export default ClassInfoCard;