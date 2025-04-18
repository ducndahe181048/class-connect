import React from 'react';
import '../../css/Schedule/EventModal.css';

const AddEventModal = ({ showAddModal, setShowAddModal, newEvent, handleInputChange, handleSaveEvent, classes, error }) => {
    return (
        showAddModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Thêm lịch giảng dạy mới</h2>
                    <div className="form-group">
                        <label>Tiêu đề: (*)</label>
                        <input
                            type="text"
                            name="title"
                            value={newEvent.title}
                            onChange={handleInputChange}
                            placeholder="Nhập tiêu đề buổi học"
                        />
                    </div>
                    <div className="form-group">
                        <label>Lớp học: (*)</label>
                        <select
                            name="class"
                            value={newEvent.class}
                            onChange={handleInputChange}
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
                        <label>Ngày: (*)</label>
                        <input
                            type="text"
                            value={newEvent.date ? new Date(newEvent.date).toLocaleDateString('vi-VN') : ''}
                            disabled={true}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Thời gian bắt đầu: (*)</label>
                            <input
                                type="time"
                                name="start"
                                value={newEvent.start}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Thời gian kết thúc: (*)</label>
                            <input
                                type="time"
                                name="end"
                                value={newEvent.end}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Địa điểm: (*)</label>
                        <input
                            type="text"
                            name="location"
                            value={newEvent.location}
                            onChange={handleInputChange}
                            placeholder="Nhập địa điểm (phòng học)"
                        />
                    </div>
                    <div className="form-group">
                        <label>Mô tả:</label>
                        <textarea
                            name="description"
                            value={newEvent.description}
                            onChange={handleInputChange}
                            placeholder="Nội dung buổi học"
                        ></textarea>
                    </div>
                    <div className='mandatory-field'>
                        Lưu ý: Các mục có (*) là bắt buộc.
                    </div>
                    <div className='error-message'>
                        {error && <div className="error-message">{error}</div>}
                    </div>
                    <div className="modal-actions">
                        <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Hủy</button>
                        <button className="save-btn" onClick={handleSaveEvent}>Lưu lại</button>
                    </div>
                </div>
            </div>
        )
    );
};

export default AddEventModal;