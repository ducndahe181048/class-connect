import React from 'react';
import { FaUpload, FaPaperPlane, FaClock } from 'react-icons/fa';
import '../../css/StudentAssignment/SubmissionForm.css';

const SubmissionForm = ({
    viewAssignment,
    submissionStatus,
    studentSubmission,
    handleFileChange,
    handleSubmitAssignment,
    loading,
}) => {
    return (
        <div className="view-section">
            {submissionStatus[viewAssignment._id]?.score || viewAssignment.status === "Đã quá hạn" ? (
                <div className="late-submission-warning">
                    <FaClock /> Lưu ý: {submissionStatus[viewAssignment._id]?.score ? "Bạn đã được chấm điểm." : "Bài tập này đã quá hạn nộp."}
                </div>
            ) : (
                <div className="submission-form">
                    <h3 className='submission-title'>Nộp bài</h3>
                    <p className='submission-description'>Vui lòng tải lên tệp đính kèm của bạn dưới đây:</p>
                    <div className="form-group">
                        <label htmlFor="submissionFile">
                            <FaUpload /> Tải lên tệp đính kèm
                        </label>
                        <input
                            type="file"
                            id="submissionFile"
                            name="submissionFile"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                        />
                        {studentSubmission.attachments.length > 0 && (
                            <div className="selected-files">
                                <p>
                                    File đã chọn: {Array.from(studentSubmission.attachments).map((file, index) => (
                                        <span key={index}>{file.name}</span>
                                    ))}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        className="submit-assignment-btn"
                        onClick={() => handleSubmitAssignment(viewAssignment._id)}
                        disabled={loading}
                    >
                        <FaPaperPlane /> Nộp bài
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubmissionForm;