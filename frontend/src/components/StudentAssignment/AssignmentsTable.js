import React from 'react';
import { FaEye } from 'react-icons/fa';
import '../../css/StudentAssignment/AssignmentsTable.css';

const AssignmentsTable = ({ assignments, submissionStatus, getClassName, formatDate, handleView }) => {
    return (
        <div className="assignments-table-container">
            <table className="assignments-table">
                <thead>
                    <tr>
                        <th>Lớp học</th>
                        <th>Tiêu đề</th>
                        <th>Mô tả</th>
                        <th>Hạn nộp</th>
                        <th>Trạng thái</th>
                        <th>Điểm</th>
                        <th>Nhận xét</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map(assignment => (
                        <tr key={assignment._id}>
                            <td>{getClassName(assignment.classId)}</td>
                            <td>{assignment.title}</td>
                            <td>{assignment.description}</td>
                            <td>{formatDate(assignment.dueDate)}</td>
                            <td>
                                {submissionStatus[assignment._id] ? (
                                    <span style={{ color: 'blue' }}>Đã nộp</span>
                                ) : (
                                    <span
                                        style={{
                                            color:
                                                assignment.status === 'Đã quá hạn'
                                                    ? 'red'
                                                    : assignment.status === 'Gần đến hạn'
                                                        ? 'orange'
                                                        : 'green',
                                            fontWeight: '700'
                                        }}
                                    >
                                        {assignment.status || 'N/A'}
                                    </span>
                                )}
                            </td>
                            <td>
                                {submissionStatus[assignment._id]?.score ? (
                                    <span style={{ color: 'green' }}>
                                        {submissionStatus[assignment._id].score}
                                    </span>
                                ) : (
                                    'Chưa có điểm'
                                )}
                            </td>
                            <td>
                                {submissionStatus[assignment._id]?.feedback ? (
                                    <span style={{ color: 'green' }}>
                                        {submissionStatus[assignment._id].feedback}
                                    </span>
                                ) : (
                                    'Chưa có nhận xét'
                                )}
                            </td>
                            <td className="actions-column">
                                <button
                                    className="action-btn view-btn"
                                    title="Xem chi tiết và nộp bài"
                                    onClick={() => handleView(assignment)}
                                >
                                    <FaEye />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignmentsTable;