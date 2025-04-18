import React from 'react';
import { FaTrashAlt, FaEdit, FaDownload } from 'react-icons/fa';
import '../../css/Upload/DocumentTable.css';

const DocumentTable = ({ documents, role, classes, onDownload, onEdit, onDelete }) => {
    return (
        <div className="documents-table-container">
            {documents.length > 0 ? (
                <table className="documents-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tiêu đề</th>
                            <th>Lớp học</th>
                            <th>Tên tài liệu</th>
                            <th>Ngày tải lên</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc, index) => (
                            <tr key={doc._id}>
                                <td>{index + 1}</td>
                                <td>{doc.name}</td>
                                <td>
                                    {doc.className
                                        ? doc.className.join(', ')
                                        : classes.find(c => c._id === doc.classId)?.name || 'N/A'}
                                </td>
                                <td>{doc.filename.substring(doc.filename.indexOf('_') + 1)}</td>
                                <td>{new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</td>
                                <td className="actions-column">
                                    <button
                                        className="action-btn download-btn"
                                        onClick={() => onDownload(doc._id, doc.filename)}
                                    >
                                        <FaDownload />
                                    </button>
                                    {role === "teacher" && (
                                        <>
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => onEdit(doc)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="action-btn delete-circle-btn"
                                                onClick={() => onDelete(doc)}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="no-documents">
                    <p>Không có tài liệu nào được tìm thấy.</p>
                </div>
            )}
        </div>
    );
};

export default DocumentTable;