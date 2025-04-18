import React from 'react';
import { FaFile, FaDownload } from 'react-icons/fa';
import '../../css/StudentAssignment/AttachmentsList.css';

const AttachmentsList = ({ attachments, handleDownload, assignmentId, submissionId }) => {
    return (
        <div className="attachments-list">
            {attachments && attachments.length > 0 ? (
                attachments.map((attachment, index) => (
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
                                onClick={() =>
                                    handleDownload(
                                        assignmentId,
                                        submissionId,
                                        attachment._id,
                                        attachment.originalName || attachment.filename
                                    )
                                }
                            >
                                <FaDownload /> Tải xuống
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p>Không có tài liệu đính kèm</p>
            )}
        </div>
    );
};

export default AttachmentsList;