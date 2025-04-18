import React from 'react';
import '../../css/ClassDetail/EnrollModal.css';

const EnrollModal = ({ onEnroll, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Bạn chưa đăng ký lớp học này</h3>
                <p>Vui lòng nhấn "Đăng ký" để tham gia lớp học.</p>
                <div className="modal-actions">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn-submit"
                        onClick={onEnroll}
                    >
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnrollModal;