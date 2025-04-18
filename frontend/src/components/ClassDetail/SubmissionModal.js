import React from 'react';
import '../../css/ClassDetail/SubmissionModal.css';

const SubmissionModal = ({ currentAssignment, submissionError, onClose, onSubmit, onFileChange }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <button
                    className="close-btn"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h3>Nộp bài tập</h3>
                <p>Bài tập: {currentAssignment?.title}</p>
                <form onSubmit={onSubmit} className='submission-form'>
                    <div className="form-group">
                        <label htmlFor="submissionFile">Chọn tệp:</label>
                        <input
                            type="file"
                            id="submissionFile"
                            name='submissionFile'
                            onChange={onFileChange}
                        />
                    </div>
                    {submissionError && <p className="error-message">{submissionError}</p>}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn-submit">Nộp bài</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmissionModal;