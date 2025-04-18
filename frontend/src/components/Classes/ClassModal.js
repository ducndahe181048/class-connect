import React from 'react';
import '../../css/Classes/ClassModal.css';

const ClassModal = ({ isOpen, closeModal, currentClass, setCurrentClass, handleSaveClass }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{currentClass._id ? 'Chỉnh sửa' : 'Thêm'} Lớp học</h2>
                <form
                    className="class-detail-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveClass();
                    }}
                >
                    <div className="form-group">
                        <label>Tên Lớp học</label>
                        <input
                            type="text"
                            value={currentClass.name}
                            onChange={(e) => setCurrentClass({ ...currentClass, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mô tả</label>
                        <input
                            type="text"
                            value={currentClass.description}
                            onChange={(e) => setCurrentClass({ ...currentClass, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Ngày bắt đầu</label>
                        <input
                            type="date"
                            value={currentClass.startDate ? new Date(currentClass.startDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setCurrentClass({ ...currentClass, startDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={closeModal}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-save">
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassModal;