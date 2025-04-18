import React from 'react';
import { FaEdit } from 'react-icons/fa';
import FilesList from './FilesList';
import StatusBadge from './StatusBadge';
import '../../css/SubmissionList/SubmissionsTable.css';

const SubmissionsTable = ({ submissions, onGrade, onDownloadFile }) => {
    if (submissions.length === 0) {
        return (
            <div className="no-submissions-message">
                <p>Không tìm thấy bài nộp nào</p>
            </div>
        );
    }

    return (
        <div className="submissions-table-container">
            <table className="submissions-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Học viên</th>
                        <th>Bài tập</th>
                        <th>Ngày nộp</th>
                        <th>Tệp đính kèm</th>
                        <th>Trạng thái</th>
                        <th>Điểm</th>
                        <th>Nhận xét</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((submission, index) => (
                        <tr key={submission._id}>
                            <td>{index + 1}</td>
                            <td className="student-name">
                                <div className="avatar-placeholder">
                                    {submission.studentId.fullname.charAt(0)}
                                </div>
                                <div>
                                    <div>{submission.studentId.fullname}</div>
                                    <div className="student-email">{submission.studentId.email}</div>
                                </div>
                            </td>
                            <td>{submission.assignmentId.title}</td>
                            <td>{new Date(submission.submissionDate).toLocaleString('vi-VN')}</td>
                            <td>
                                <FilesList
                                    files={submission.files}
                                    onDownload={(fileId, fileName) => onDownloadFile(submission._id, fileId, fileName)}
                                />
                            </td>
                            <td>
                                <StatusBadge status={submission.status} />
                            </td>
                            <td>{submission.score !== null ? submission.score : '—'}</td>
                            <td>{submission.feedback !== '' ? submission.feedback : '—'}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="action-button edit-button"
                                        title="Chấm điểm"
                                        onClick={() => onGrade(submission)}
                                    >
                                        <FaEdit />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubmissionsTable;