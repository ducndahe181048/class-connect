import React from 'react';
import { FaClipboardList, FaFileAlt, FaUsers } from 'react-icons/fa';
import '../../css/ClassDetail/OverviewTab.css';

const OverviewTab = ({ classData, role }) => {
    return (
        <div className="overview-tab">
            <h3>Tổng quan lớp học</h3>
            <p style={{ marginTop: '1rem' }}>Đây là trang tổng quan về lớp học {classData.name}. Bạn có thể xem thông tin chi tiết về các bài học, bài tập và tài liệu của lớp học.</p>

            <div className="class-stats">
                <div className="stat-card">
                    <FaClipboardList className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">Bài tập</span>: <span className="stat-count">{classData.assignments?.length || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <FaFileAlt className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-label">Tài liệu</span>: <span className="stat-count">{classData.documents?.length || 0}</span>
                    </div>
                </div>

                {role === "teacher" && (
                    <div className="stat-card">
                        <FaUsers className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-label">Học viên</span>: <span className="stat-count">{classData.students?.length || 0}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverviewTab;