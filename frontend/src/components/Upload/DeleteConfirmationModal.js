import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../../css/Upload/DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ show, document, onClose, onDelete, isLoading, error }) => {
    if (!show || !document) return null;

    const displayName = document.filename.substring(document.filename.indexOf('_') + 1);

    return (
        <div className="delete-confirmation-modal-overlay">
            <div className="delete-confirmation-modal-content delete-confirmation-modal">
                <h2>Xác nhận xóa</h2>
                <p>Bạn có chắc chắn muốn xóa tài liệu <strong>{displayName}</strong>?</p>

                {error && <div className="error-message">{error}</div>}

                <div className="delete-confirmation-modal-buttons">
                    <button onClick={onClose} className="cancel-btn">
                        Hủy
                    </button>
                    <button
                        onClick={() => onDelete(document._id)}
                        className="delete-confirm-btn"
                    >
                        {isLoading ? <FaSpinner className="spinner" /> : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;