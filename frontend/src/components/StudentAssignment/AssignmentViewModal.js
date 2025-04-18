import React from 'react';
import { FaTimes } from 'react-icons/fa';
import AttachmentsList from './AttachmentsList';
import SubmissionForm from './SubmissionForm';
import '../../css/StudentAssignment/AssignmentViewModal.css';

const AssignmentViewModal = ({
    showViewModal,
    viewAssignment,
    setShowViewModal,
    getClassName,
    formatDate,
    handleDownloadAttachment,
    studentSubmission,
    handleFileChange,
    handleSubmitAssignment,
    submissionStatus,
    loading,
}) => {
    return (
        <>
            {showViewModal && viewAssignment && (
                <div className="modal-overlay">
                    <div className="assignment-view-container">
                        <div className="view-header">
                            <h2>Chi tiết Bài tập</h2>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="assignment-view-content">
                            <div className="view-section">
                                <h3>Tiêu đề</h3>
                                <p>{viewAssignment.title}</p>
                            </div>

                            <div className="view-section">
                                <h3>Lớp học</h3>
                                <p>{getClassName(viewAssignment.classId)}</p>
                            </div>

                            <div className="view-section">
                                <h3>Mô tả</h3>
                                <p>{viewAssignment.description || 'Không có mô tả'}</p>
                            </div>

                            <div className="view-section">
                                <h3>Hạn nộp</h3>
                                <p>{formatDate(viewAssignment.dueDate)}</p>
                            </div>

                            <div className="view-section">
                                <h3>Tài liệu đính kèm</h3>
                                <AttachmentsList
                                    attachments={viewAssignment.attachments}
                                    handleDownload={(assignmentId, submissionId, attachmentId, fileName) =>
                                        handleDownloadAttachment(assignmentId, attachmentId, fileName)
                                    }
                                    assignmentId={viewAssignment._id}
                                />
                            </div>

                            <SubmissionForm
                                viewAssignment={viewAssignment}
                                submissionStatus={submissionStatus}
                                studentSubmission={studentSubmission}
                                handleFileChange={handleFileChange}
                                handleSubmitAssignment={handleSubmitAssignment}
                                loading={loading}
                            />

                            <div className="view-actions">
                                <button
                                    className="close-view-btn"
                                    onClick={() => setShowViewModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignmentViewModal;