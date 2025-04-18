import React from 'react';
import AssignmentItem from './AssignmentItem';
import '../../css/ClassDetail/AssignmentsTab.css';

const AssignmentsTab = ({ assignments, role, downloadAttachment, setCurrentAssignment, setIsModalOpen }) => {
    const handleSubmitClick = (assignment) => {
        setCurrentAssignment(assignment);
        setIsModalOpen(true);
    };

    return (
        <div className="assignments-tab">
            <h3>Danh sách bài tập</h3>

            {assignments && assignments.length > 0 ? (
                <div className="assignment-list">
                    {assignments.map((assignment) => (
                        <AssignmentItem
                            key={assignment._id}
                            assignment={assignment}
                            role={role}
                            downloadAttachment={downloadAttachment}
                            onSubmit={handleSubmitClick}
                        />
                    ))}
                </div>
            ) : (
                <p className="empty-message">Chưa có bài tập nào</p>
            )}
        </div>
    );
};

export default AssignmentsTab;