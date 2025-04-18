import React from 'react';
import '../../css/SubmissionList/GradingModal.css';

const GradingModal = ({ submission, score, feedback, onScoreChange, onFeedbackChange, onSave, onCancel, error }) => {
    if (!submission) return null;

    return (
        <div className="modal-overlay">
            <div className="grading-modal">
                <h2>Chấm điểm bài nộp</h2>
                <div className="submission-info">
                    <p><strong>Học viên:</strong> {submission.studentId.fullname}</p>
                    <p><strong>Bài tập:</strong> {submission.assignmentId.title}</p>
                    <p><strong>Ngày nộp:</strong> {new Date(submission.submissionDate).toLocaleString('vi-VN')}</p>
                </div>

                <div className="grading-form">
                    <div className="form-group">
                        <label htmlFor="score">Điểm số (0-10):</label>
                        <input
                            type="number"
                            id="score"
                            min="0"
                            max="10"
                            step="0.1"
                            value={score}
                            onChange={(e) => onScoreChange(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="feedback">Nhận xét:</label>
                        <textarea
                            id="feedback"
                            rows="4"
                            value={feedback}
                            onChange={(e) => onFeedbackChange(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {error && (
                    <div className='error-message'>
                        <p>{error}</p>
                    </div>
                )}

                <div className="modal-buttons">
                    <button className="cancel-button" onClick={onCancel}>Hủy</button>
                    <button className="save-button" onClick={onSave}>Lưu</button>
                </div>
            </div>
        </div>
    );
};

export default GradingModal;