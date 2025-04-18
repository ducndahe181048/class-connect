import React from 'react';
import '../../css/ClassDetail/StudentsTab.css';

const StudentsTab = ({ students }) => {
    return (
        <div className="students-tab">
            <h3>Danh sách học viên</h3>

            <div className="students-count">
                <span>Hiển thị {students.length || '0'} học viên</span>
            </div>

            <div className="students-table-container">
                {students && students.length > 0 ? (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ và tên</th>
                                <th>Email</th>
                                <th>Ngày sinh</th>
                                <th>Trường</th>
                                <th>Lớp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student._id}>
                                    <td>{index + 1}</td>
                                    <td className="student-name">
                                        <div className="avatar-placeholder">
                                            {student.fullname.charAt(0)}
                                        </div>
                                        {student.fullname}
                                    </td>
                                    <td>{student.email}</td>
                                    <td>{new Date(student.dob).toLocaleDateString('vi-VN')}</td>
                                    <td>{student.school}</td>
                                    <td>{student.classroom}</td>
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
        </div>
    );
};

export default StudentsTab;