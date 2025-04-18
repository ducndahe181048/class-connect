import React from 'react';
import { FaDownload } from 'react-icons/fa';
import '../../css/ClassDetail/DocumentsTab.css';

const DocumentsTab = ({ documents, downloadDocument }) => {
    return (
        <div className="documents-tab">
            <h3>Danh sách tài liệu</h3>

            <div className="documents-count">
                <span>Hiển thị {documents.length || '0'} tài liệu</span>
            </div>

            <div className="documents-table-container">
                {documents && documents.length > 0 ? (
                    <table className="documents-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Chú thích</th>
                                <th>Tên file</th>
                                <th>Ngày tải lên</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((document, index) => (
                                <tr key={document._id}>
                                    <td>{index + 1}</td>
                                    <td>{document.name}</td>
                                    <td>{document.description}</td>
                                    <td>{document.filename.substring(document.filename.indexOf('_') + 1)}</td>
                                    <td>{new Date(document.uploadDate).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <button
                                            className="action-btn download-btn"
                                            onClick={() => downloadDocument(document._id, document.name || document.filename)}
                                            style={{ alignItems: 'center' }}
                                        >
                                            <FaDownload />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-documents-message">
                        <p>Không tìm thấy tài liệu nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsTab;