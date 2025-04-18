import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../../css/Upload/DocumentModal.css';

const DocumentModal = ({ isEditing = false, show, onClose, formData, onChange, onFileChange, onSubmit, classes, isLoading, error, currentDocument = null }) => {
    if (!show) return null;

    return (
        <div className="document-modal-overlay">
            <div className="document-modal-content">
                <h2>{isEditing ? 'Chỉnh sửa Tài liệu' : 'Thêm Tài liệu mới'}</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Tiêu đề:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mô tả:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Lớp học:</label>
                        <select
                            name="classId"
                            value={formData.classId}
                            onChange={onChange}
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

                    {isEditing && currentDocument && (
                        <div className="form-group">
                            <label>Tài liệu hiện tại:</label>
                            <p>{currentDocument.filename.substring(currentDocument.filename.indexOf('_') + 1)}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label>{isEditing ? 'Tài liệu mới (tùy chọn):' : 'Tài liệu:'}</label>
                        <input
                            type="file"
                            onChange={onFileChange}
                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                            required={!isEditing}
                        />
                        {!isEditing && (
                            <small className="file-format-hint">
                                Định dạng hỗ trợ: PDF, DOCX, DOC, TXT, XLS, XLSX, PPT, PPTX
                            </small>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="document-modal-buttons">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Hủy
                        </button>
                        <button type="submit" className="submit-btn">
                            {isLoading ? (
                                <FaSpinner className="spinner" />
                            ) : (
                                isEditing ? "Cập nhật" : "Tải lên"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentModal;