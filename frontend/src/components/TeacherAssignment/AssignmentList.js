import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import '../../css/TeacherAssignment/AssignmentList.css';

const AssignmentList = ({
    assignments,
    getClassName,
    onView,
    onEdit,
    onDelete,
    searchTerm,
    selectedClass
}) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (assignments.length === 0) {
        return (
            <div className="no-assignments">
                {searchTerm || selectedClass !== 'all'
                    ? "Không tìm thấy bài tập nào khớp với điều kiện tìm kiếm."
                    : "Chưa có bài tập nào. Nhấn 'Tạo Bài tập mới' để bắt đầu."}
            </div>
        );
    }

    return (
        <div className="assignments-table-container">
            <table className="assignments-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Lớp học</th>
                        <th>Tiêu đề</th>
                        <th>Hạn nộp</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map((assignment, index) => (
                        <tr key={assignment._id}>
                            <td>{index + 1}</td>
                            <td>{getClassName(assignment.classId)}</td>
                            <td>{assignment.title}</td>
                            <td>{formatDate(assignment.dueDate)}</td>
                            <td>
                                {assignment.status === 'Đã quá hạn' && (
                                    <span style={{ color: 'red', fontWeight: '700' }}>{assignment.status}</span>
                                )}
                                {assignment.status === 'Gần đến hạn' && (
                                    <span style={{ color: 'orange', fontWeight: '700' }}>{assignment.status}</span>
                                )}
                                {assignment.status === 'Chưa đến hạn' && (
                                    <span style={{ color: 'green', fontWeight: '700' }}>{assignment.status}</span>
                                )}
                            </td>
                            <td className="actions-column">
                                <button
                                    className="action-btn view-btn"
                                    title="Xem chi tiết"
                                    onClick={() => onView(assignment)}
                                >
                                    <FaEye />
                                </button>
                                <button
                                    className="action-btn edit-btn"
                                    title="Chỉnh sửa"
                                    onClick={() => onEdit(assignment)}
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    title="Xóa"
                                    onClick={() => onDelete(assignment._id)}
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignmentList;