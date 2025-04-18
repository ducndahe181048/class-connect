import React from 'react';
import { FaTrash } from 'react-icons/fa';
import '../../css/Schedule/EventModal.css';

const EditEventModal = ({ showEditModal, setShowEditModal, newEvent, handleInputChange, handleUpdateEvent, openDeleteModal, classes, role, error, currentEvent }) => {
    return (
        showEditModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Chỉnh sửa lịch giảng dạy</h2>
                    <div className="form-group">
                        <label>Tiêu đề:</label>
                        <input
                            type="text"
                            name="title"
                            value={newEvent.title}
                            onChange={handleInputChange}
                            disabled={role === "teacher" ? false : true}
                        />
                    </div>
                    <div className="form-group">
                        <label>Lớp học:</label>
                        <select
                            name="class"
                            value={newEvent.class}
                            onChange={handleInputChange}
                            disabled={role === "teacher" ? false : true}
                            required
                        >
                            <option value="">Chọn lớp học</option>
                            {classes.map(classItem => (
                                <option key={classItem._id} value={classItem._id}>
                                    {classItem.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Ngày:</label>
                        <input
                            type="text"
                            value={new Date(newEvent.date).toLocaleDateString('vi-VN')}
                            disabled={true}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Thời gian bắt đầu:</label>
                            <input
                                type="time"
                                name="start"
                                value={newEvent.start}
                                disabled={role === "teacher" ? false : true}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Thời gian kết thúc:</label>
                            <input
                                type="time"
                                name="end"
                                value={newEvent.end}
                                disabled={role === "teacher" ? false : true}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Địa điểm:</label>
                        <input
                            type="text"
                            name="location"
                            value={newEvent.location}
                            disabled={role === "teacher" ? false : true}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mô tả:</label>
                        <textarea
                            name="description"
                            value={newEvent.description}
                            disabled={role === "teacher" ? false : true}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    {role === "teacher" && (
                        <div className='error-message'>
                            {error && <div className="error-message">{error}</div>}
                        </div>
                    )}
                    {role === "teacher" && (
                        <div className="modal-actions">
                            <button className="delete-confirm-btn" onClick={() => openDeleteModal(currentEvent)}>
                                <FaTrash /> Xóa
                            </button>
                            <div>
                                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Hủy</button>
                                <button className="save-btn" onClick={handleUpdateEvent}>Cập nhật</button>
                            </div>
                        </div>
                    )}
                    {role === "student" && (
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Đóng</button>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default EditEventModal;