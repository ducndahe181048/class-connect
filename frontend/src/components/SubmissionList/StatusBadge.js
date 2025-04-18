import React from 'react';
import '../../css/SubmissionList/StatusBadge.css';

const StatusBadge = ({ status }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'Submitted':
                return 'status-submitted';
            case 'Graded':
                return 'status-graded';
            default:
                return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Submitted':
                return 'Đã nộp';
            case 'Graded':
                return 'Đã chấm';
            default:
                return status;
        }
    };

    return (
        <span className={`status-badge ${getStatusClass(status)}`}>
            {getStatusText(status)}
        </span>
    );
};

export default StatusBadge;