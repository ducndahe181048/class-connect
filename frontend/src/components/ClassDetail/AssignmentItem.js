import React from 'react';
import { FaDownload } from 'react-icons/fa';
import '../../css/ClassDetail/AssignmentItem.css';

const AssignmentItem = ({ assignment, role, downloadAttachment, onSubmit }) => {
    return (
        <div className="assignment-item">
            <div className="assignment-header">
                <h4>{assignment.title}</h4>
                {assignment.status === "Đã quá hạn" && (
                    <div className="assignment-status" style={{ color: 'white', backgroundColor: 'red' }}>
                        {assignment.status || 'N/A'}
                    </div>
                )}
                {assignment.status === "Gần đến hạn" && (
                    <div className="assignment-status" style={{ color: 'white', backgroundColor: 'orange' }}>
                        {assignment.status || 'N/A'}
                    </div>
                )}
                {assignment.status === "Chưa đến hạn" && (
                    <div className="assignment-status" style={{ color: 'white', backgroundColor: 'green' }}>
                        {assignment.status || 'N/A'}
                    </div>
                )}
            </div>

            <div className="assignment-content">
                <p>{assignment.description || 'No description available'}</p>
                <p><strong>Hạn nộp:</strong> {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</p>

                {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="assignment-attachments">
                        <h5>Tài liệu đính kèm:</h5>
                        <div className="attachments-list">
                            {assignment.attachments.map((attachment) => (
                                <div key={attachment._id} className="attachment-item">
                                    <div className="attachment-info">
                                        <span className="file-name">
                                            {attachment.filename.substring(attachment.filename.indexOf('_') + 1)}
                                        </span>
                                    </div>
                                    <button
                                        className="download-attachment-btn"
                                        onClick={() => downloadAttachment(
                                            assignment._id,
                                            attachment._id,
                                            attachment.originalName || attachment.filename
                                        )}
                                    >
                                        <FaDownload />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {role === "student" && assignment?.status !== "Đã quá hạn" && (
                <div className="assignment-submission">
                    <button
                        className="submit-assignment-btn"
                        onClick={() => onSubmit(assignment)}
                    >
                        Nộp bài
                    </button>
                </div>
            )}
        </div>
    );
};

export default AssignmentItem;