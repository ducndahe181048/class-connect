import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const DeleteConfirmationModal = ({ showDeleteModal, closeDeleteModal, handleDeleteEvent, currentEvent, loading }) => {
    return (
        showDeleteModal && (
            <div className="modal-overlay">
                <div className="modal-content delete-modal">
                    <h2>Xác nhận xóa</h2>
                    <p>Bạn có chắc chắn muốn xóa <strong>{currentEvent.title}</strong>?</p>
                    <div className="modal-buttons">
                        <button onClick={closeDeleteModal} className="cancel-btn">
                            Hủy
                        </button>
                        <button
                            onClick={handleDeleteEvent}
                            className="delete-confirm-btn"
                        >
                            {loading ? <FaSpinner className="spinner" /> : "Xóa"}
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default DeleteConfirmationModal;