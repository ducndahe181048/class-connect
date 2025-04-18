import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/SubmissionList/SubmissionList.css';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import SearchFilterBar from '../components/SearchFilterBar';
import SubmissionsTable from '../components/SubmissionList/SubmissionsTable';
import GradingModal from '../components/SubmissionList/GradingModal';
import Pagination from '../components/Pagination';
import { FaFileAlt, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SubmissionList = () => {
    const [submissions, setSubmissions] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const [assignmentsResponse, submissionsResponse] = await Promise.all([
                axios.get(`http://localhost:5000/assignment/assignments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/submission/teacher/submissions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setAssignments(assignmentsResponse.data);
            setSubmissions(submissionsResponse.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Đã xảy ra lỗi khi tải dữ liệu');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = submissions;

        if (selectedAssignment !== 'all') {
            filtered = filtered.filter(submission => submission.assignmentId._id === selectedAssignment);
        }

        if (searchTerm) {
            filtered = filtered.filter(submission =>
                submission.studentId.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredSubmissions(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [submissions, selectedAssignment, searchTerm]);

    const handleAssignmentChange = (value) => {
        setSelectedAssignment(value);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    const openGradingModal = (submission) => {
        setError('');
        setSelectedSubmission(submission);
        setScore(submission.score || '');
        setFeedback(submission.feedback || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setError('');
        setIsModalOpen(false);
        setSelectedSubmission(null);
    };

    const handleGradeSubmission = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.post(`http://localhost:5000/submission/teacher/grade/${selectedSubmission._id}`,
                { score, feedback },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setSelectedSubmission(response.data);
            fetchData();
            closeModal();
        } catch (err) {
            console.error('Error grading submission:', err);
            setError('Có lỗi xảy ra khi chấm điểm bài nộp');
        }
    };

    const handleDownloadFile = async (submissionId, fileId, fileName) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.get(
                `http://localhost:5000/submission/download/submission/${submissionId}/file/${fileId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading file:', err);
            setError('Có lỗi xảy ra khi tải tệp');
        }
    };

    // Calculate paginated submissions
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubmissions = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) {
        return (
            <>
                <Navbar />
                <Loading />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="submission-list-container">
                <div className="submission-list-header">
                    <div className="header-title">
                        <FaFileAlt className="header-icon" />
                        <h1>Chấm điểm bài làm của học sinh</h1>
                    </div>
                </div>

                <div className="classes-navigation">
                    <Link to="/dashboard" className="back-link">
                        <FaArrowLeft /> Quay lại
                    </Link>
                </div>

                <SearchFilterBar
                    searchPlaceholder="Tìm kiếm bài nộp ..."
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    filterOptions={assignments}
                    selectedFilter={selectedAssignment}
                    onFilterChange={handleAssignmentChange}
                    filterPlaceholder="Tất cả bài tập"
                />

                <div className="submissions-count">
                    <span>Hiển thị {filteredSubmissions.length || '0'} bài nộp</span>
                </div>

                <SubmissionsTable
                    submissions={currentSubmissions}
                    onGrade={openGradingModal}
                    onDownloadFile={handleDownloadFile}
                />

                <Pagination
                    totalItems={filteredSubmissions.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />

                {isModalOpen && (
                    <GradingModal
                        submission={selectedSubmission}
                        score={score}
                        feedback={feedback}
                        onScoreChange={setScore}
                        onFeedbackChange={setFeedback}
                        onSave={handleGradeSubmission}
                        onCancel={closeModal}
                        error={error}
                    />
                )}
            </div>
        </>
    );
};

export default SubmissionList;