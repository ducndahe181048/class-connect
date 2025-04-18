import React from 'react';
import { FaListUl, FaClipboardList, FaFileAlt, FaUsers } from 'react-icons/fa';
import '../../css/ClassDetail/ClassTabs.css';

const ClassTabs = ({ activeTab, setActiveTab, role }) => {
    return (
        <div className="class-detail-tabs">
            <button
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
            >
                <FaListUl /> Tổng quan
            </button>
            <button
                className={activeTab === 'assignments' ? 'active' : ''}
                onClick={() => setActiveTab('assignments')}
            >
                <FaClipboardList /> Bài tập
            </button>
            <button
                className={activeTab === 'documents' ? 'active' : ''}
                onClick={() => setActiveTab('documents')}
            >
                <FaFileAlt /> Tài liệu
            </button>
            {role === "teacher" && (
                <button
                    className={activeTab === 'students' ? 'active' : ''}
                    onClick={() => setActiveTab('students')}
                >
                    <FaUsers /> Học viên
                </button>
            )}
        </div>
    );
};

export default ClassTabs;