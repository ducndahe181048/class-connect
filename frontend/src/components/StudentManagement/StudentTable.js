import React from 'react';
import '../../css/StudentManagement/StudentTable.css';

const StudentTable = ({ students }) => {
    return (
        <>
            <div className="students-count">
                <span>Hiển thị {students.length || '0'} học viên</span>
            </div>

            <div className="students-table-container">
                {students.length > 0 ? (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ và tên</th>
                                <th>Email</th>
                                <th>Ngày sinh</th>
                                <th>Trường</th>
                                <th>Lớp</th>
                                <th>Lớp học</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student._id || index}>
                                    <td>{index + 1}</td>
                                    <td className="student-name">
                                        <div className="avatar-placeholder">
                                            {(student.fullname || 'N/A').charAt(0)}
                                        </div>
                                        {student.fullname || 'N/A'}
                                    </td>
                                    <td>{student.email || 'N/A'}</td>
                                    <td>
                                        {student.dob
                                            ? new Date(student.dob).toLocaleDateString('vi-VN')
                                            : 'N/A'}
                                    </td>
                                    <td>{student.school || 'N/A'}</td>
                                    <td>{student.classroom || 'N/A'}</td>
                                    <td>
                                        {Array.isArray(student.className) && student.className.length > 0
                                            ? student.className.join(', ')
                                            : 'Chưa phân lớp'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-students-message">
                        <p>Không tìm thấy học viên nào</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default StudentTable;