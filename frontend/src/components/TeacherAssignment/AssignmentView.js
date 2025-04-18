import React from 'react';
import { FaTimes, FaEdit, FaFile, FaDownload, FaTrash } from 'react-icons/fa';
import '../../css/TeacherAssignment/AssignmentView.css';

const AssignmentView = ({
    assignment,
    getClassName,
    onClose,
    onEdit,
    onDownloadAttachment,
    onDeleteAttachment
}) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="modal-overlay">
            <div className="assignment-view-container">
                <div className="view-header">
                    <h2>Chi tiết Bài tập</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="assignment-view-content">
                    <div className="view-section">
                        <h3>Tiêu đề</h3>
                        <p>{assignment.title}</p>
                    </div>

                    <div className="view-section">
                        <h3>Lớp học</h3>
                        <p>{getClassName(assignment.classId)}</p>
                    </div>

                    <div className="view-section">
                        <h3>Mô tả</h3>
                        <p>{assignment.description || 'Không có mô tả'}</p>
                    </div>

                    <div className="view-section">
                        <h3>Hạn nộp</h3>
                        <p>{formatDate(assignment.dueDate)}</p>
                    </div>

                    <div className="view-section">
                        <h3>Tài liệu đính kèm</h3>
                        {assignment.attachments && assignment.attachments.length > 0 ? (
                            <div className="attachments-list">
                                {assignment.attachments.map((attachment, index) => (
                                    <div key={index} className="attachment-item">
                                        <div className="attachment-info">
                                            <FaFile className="file-icon" />
                                            <span className="file-name">
                                                {attachment.filename.substring(attachment.filename.indexOf('_') + 1)}
                                            </span>
                                        </div>
                                        <div className="attachment-actions">
                                            <button
                                                className="download-btn"
                                                onClick={() => onDownloadAttachment(
                                                    assignment._id,
                                                    attachment._id,
                                                    attachment.originalName || attachment.filename
                                                )}
                                            >
                                                <FaDownload /> Tải xuống
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => onDeleteAttachment(assignment._id, attachment._id)}
                                            >
                                                <FaTrash /> Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='no-assignment-documents'>Không có tài liệu đính kèm</p>
                        )} 
                    </div>

                    <div className="view-actions">
                        <button
                            className="edit-confirm-btn"
                            onClick={onEdit}
                        >
                            <FaEdit /> Chỉnh sửa
                        </button>
                        <button
                            className="close-view-btn"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentView;