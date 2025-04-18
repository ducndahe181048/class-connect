import React, { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import '../../css/TeacherAssignment/AssignmentForm.css';

const AssignmentForm = ({ assignment, classes, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: assignment.title || '',
        description: assignment.description || '',
        dueDate: assignment.dueDate || '',
        classId: assignment.classId || '',
        attachments: [],
    });
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            attachments: Array.from(e.target.files)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // Validate form
        if (!formData.title.trim()) {
            setError("Tiêu đề không được để trống");
            return;
        }
        if (!formData.classId) {
            setError("Vui lòng chọn lớp học");
            return;
        }
        if (!formData.dueDate) {
            setError("Vui lòng chọn hạn nộp");
            return;
        }

        // Create FormData for API submission
        const submitFormData = new FormData();

        // Add the assignment ID if we're editing
        if (assignment._id) {
            submitFormData.append('_id', assignment._id);
        }

        // Append text fields
        submitFormData.append('title', formData.title);
        submitFormData.append('description', formData.description);
        submitFormData.append('dueDate', formData.dueDate);
        submitFormData.append('classId', formData.classId);

        // Append files
        if (formData.attachments && formData.attachments.length > 0) {
            formData.attachments.forEach(file => {
                if (file instanceof File) {
                    submitFormData.append('attachments', file);
                }
            });
        }

        onSave(submitFormData);
    };

    return (
        <div className="modal-overlay">
            <div className="assignment-form-container">
                <div className="form-header">
                    <h2>{assignment._id ? 'Chỉnh sửa Bài tập' : 'Tạo Bài tập mới'}</h2>
                    <button className="close-btn" onClick={onCancel}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="assignment-form">
                    <div className="form-group">
                        <label htmlFor="title">Tiêu đề bài tập *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="classId">Lớp học *</label>
                        <select
                            id="classId"
                            name="classId"
                            value={formData.classId}
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
                        <label htmlFor="description">Mô tả bài tập</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dueDate">Hạn nộp *</label>
                        <input
                            type="datetime-local"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="attachments">Tài liệu đính kèm</label>
                        <input
                            type="file"
                            id="attachments"
                            name="attachments"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                            multiple
                        />
                        {assignment._id && (
                            <small>Chú ý: Tải lên tệp mới sẽ thêm vào các tệp đính kèm hiện có</small>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onCancel}>
                            Hủy
                        </button>
                        <button type="submit" className="submit-btn">
                            <FaSave /> {assignment._id ? 'Cập nhật' : 'Tạo bài tập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentForm;