import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../../css/Classes/DeleteConfirmationModal.css';

const DeleteModal = ({ isOpen, closeModal, currentClass, handleDeleteClass, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content delete-modal">
                <h2>Xác nhận xóa</h2>
                <p>Bạn có chắc chắn muốn xóa lớp <strong>{currentClass.name}</strong>?</p>
                <div className="modal-buttons">
                    <button onClick={closeModal} className="cancel-btn">
                        Hủy
                    </button>
                    <button onClick={() => handleDeleteClass(currentClass._id)} className="delete-confirm-btn">
                        {isLoading ? <FaSpinner className="spinner" /> : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;