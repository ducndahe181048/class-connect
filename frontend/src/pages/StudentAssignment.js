import React, { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaClipboardList,
    FaEye,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/StudentAssignment/StudentAssignment.css';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import SearchFilterBar from '../components/SearchFilterBar';
import AssignmentViewModal from '../components/StudentAssignment/AssignmentViewModal';
import AssignmentsTable from '../components/StudentAssignment/AssignmentsTable';
import Pagination from '../components/Pagination';

const StudentAssignment = () => {
    const [role, setRole] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewAssignment, setViewAssignment] = useState(null);
    const [studentSubmission, setStudentSubmission] = useState({
        attachments: [],
    });
    const [submissionStatus, setSubmissionStatus] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        window.scrollTo(0, 0);
        const user = localStorage.getItem("user");

        if (user) {
            const userObject = JSON.parse(user);
            setRole(userObject?.user?.role || "");
        } else {
            setError("No user data found");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (role) {
            fetchData();
        }
    }, [role]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }

            const [assignmentsResponse, classesResponse, submissionsResponse] = await Promise.all([
                axios.get(`http://localhost:5000/assignment/student/assignments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/class/student`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/submission/student`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setAssignments(assignmentsResponse.data);
            setClasses(classesResponse.data);

            const submissionMap = {};
            submissionsResponse.data.forEach(submission => {
                submissionMap[submission.assignmentId._id] = {
                    status: "Đã nộp",
                    submittedAt: submission.submittedAt,
                    id: submission._id,
                    score: submission.score,
                    feedback: submission.feedback,
                    attachments: submission.attachments
                };
            });

            setSubmissionStatus(submissionMap);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setStudentSubmission({
            ...studentSubmission,
            attachments: Array.from(e.target.files)
        });
    };

    const handleSubmitAssignment = async (assignmentId) => {
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('assignmentId', assignmentId);

            if (studentSubmission.attachments && studentSubmission.attachments.length > 0) {
                studentSubmission.attachments.forEach(file => {
                    if (file instanceof File) {
                        formData.append('submissionFile', file);
                    }
                });
            }

            await axios.post(`http://localhost:5000/submission/submissions`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            setSubmissionStatus("Đã nộp thành công");

            setStudentSubmission({
                attachments: [],
            });
            fetchData();
            setShowViewModal(false);
        } catch (err) {
            console.error('Error submitting assignment:', err);
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (assignment) => {
        setViewAssignment(assignment);
        setStudentSubmission({
            attachments: [],
        });
        setShowViewModal(true);
    };

    const handleDownloadAttachment = async (assignmentId, attachmentId, fileName) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/assignment/download/${assignmentId}/attachment/${attachmentId}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false);
        } catch (error) {
            console.error('Error downloading attachment:', error);
            setLoading(false);
        }
    };

    const handleDownloadSubmissionAttachment = async (submissionId, attachmentId, fileName) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/submission/download/${submissionId}/attachment/${attachmentId}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false);
        } catch (error) {
            console.error('Error downloading submission attachment:', error);
            setLoading(false);
        }
    };

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

    const getClassName = (classId) => {
        if (!classId) return 'N/A';
        if (typeof classId === 'object' && classId.name) return classId.name;

        const foundClass = classes.find(cls => cls._id === classId);
        return foundClass ? foundClass.name : 'N/A';
    };

    useEffect(() => {
        let filtered = assignments;

        if (selectedClass !== 'all') {
            filtered = filtered.filter(assignment => assignment.classId && assignment.classId._id.includes(selectedClass));
        }

        if (searchTerm) {
            filtered = filtered.filter(assignment =>
                assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAssignments(filtered);
        setCurrentPage(1);
    }, [assignments, selectedClass, searchTerm]);

    const handleClassChange = (value) => {
        setSelectedClass(value);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    // Calculate paginated
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAssignments = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);

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
            <div className="assignments-container">
                <div className="assignments-header">
                    <div className="header-title">
                        <FaClipboardList className="header-icon" />
                        <h1>Bài tập của tôi</h1>
                    </div>
                </div>

                <div className="classes-navigation">
                    <Link to="/dashboard" className="back-link">
                        <FaArrowLeft /> Quay lại
                    </Link>
                </div>

                <SearchFilterBar
                    searchPlaceholder="Tìm kiếm bài tập ..."
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    filterOptions={classes}
                    selectedFilter={selectedClass}
                    onFilterChange={handleClassChange}
                    filterPlaceholder="Tất cả lớp học"
                />

                {filteredAssignments.length === 0 ? (
                    <div className="no-assignments">
                        {searchTerm || selectedClass !== 'all'
                            ? "Không tìm thấy bài tập nào khớp với điều kiện tìm kiếm."
                            : "Chưa có bài tập nào được giao."}
                    </div>
                ) : (
                    <>
                        <AssignmentsTable
                            assignments={currentAssignments}
                            submissionStatus={submissionStatus}
                            getClassName={getClassName}
                            formatDate={formatDate}
                            handleView={handleView}
                        />
                        <Pagination
                            totalItems={filteredAssignments.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}

                <AssignmentViewModal
                    showViewModal={showViewModal}
                    viewAssignment={viewAssignment}
                    setShowViewModal={setShowViewModal}
                    getClassName={getClassName}
                    formatDate={formatDate}
                    handleDownloadAttachment={handleDownloadAttachment}
                    studentSubmission={studentSubmission}
                    handleFileChange={handleFileChange}
                    handleSubmitAssignment={handleSubmitAssignment}
                    submissionStatus={submissionStatus}
                    loading={loading}
                />
            </div>
        </>
    );
};

export default StudentAssignment;