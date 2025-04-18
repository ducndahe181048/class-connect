import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaIdCard, FaBook, FaUsers, FaArrowLeft } from 'react-icons/fa';
import '../../css/Classes/ClassesGrid.css';

const ClassesGrid = ({ classes, role, handleEditClass, openDeleteModal }) => {
    return (
        <div className="classes-grid">
            {classes.map((classItem) => (
                <div key={classItem._id} className="class-card">
                    <div className="class-header" style={{ backgroundColor: "#7f79e4" }}>
                        <h2 style={{ color: 'white', fontWeight: '700' }}>{classItem.name}</h2>
                        <div className="class-actions">
                            {role === "teacher" && (
                                <>
                                    <button className="btn-edit" onClick={() => handleEditClass(classItem)}>
                                        <FaEdit />
                                    </button>
                                    <button className="btn-delete" onClick={() => openDeleteModal(classItem)}>
                                        <FaTrash />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <Link to={`/class/${classItem._id}`} className="class-content">
                        <p className="class-id">
                            <FaIdCard /> Mã lớp: {classItem._id}
                        </p>
                        <p className="class-description">
                            <FaBook /> {classItem.description || "Chưa cập nhật"}
                        </p>
                        {role === "teacher" && (
                            <p className="class-students">
                                <FaUsers /> Số học viên: {classItem.numberOfStudents || 0}
                            </p>
                        )}
                        {role === "student" && (
                            <p className="class-teacher">
                                <FaUsers /> Giảng viên: {classItem.userId?.fullname || "N/A"}
                            </p>
                        )}
                        <p className="class-date">
                            <FaArrowLeft /> Bắt đầu: {new Date(classItem.startDate).toLocaleDateString('vi-VN')}
                        </p>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default ClassesGrid;