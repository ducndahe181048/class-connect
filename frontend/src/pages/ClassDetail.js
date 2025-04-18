import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../css/ClassDetail/ClassDetail.css';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import Error from '../components/Error';
import ClassHeader from '../components/ClassDetail/ClassHeader';
import ClassInfoCard from '../components/ClassDetail/ClassInfoCard';
import EnrollModal from '../components/ClassDetail/EnrollModal';
import ClassTabs from '../components/ClassDetail/ClassTabs';
import OverviewTab from '../components/ClassDetail/OverviewTab';
import AssignmentsTab from '../components/ClassDetail/AssignmentsTab';
import DocumentsTab from '../components/ClassDetail/DocumentsTab';
import StudentsTab from '../components/ClassDetail/StudentsTab';
import SubmissionModal from '../components/ClassDetail/SubmissionModal';

const ClassDetail = () => {
    const { classId } = useParams();
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState("");
    const [activeTab, setActiveTab] = useState('overview');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const user = localStorage.getItem("user");
        if (user) {
            const userObject = JSON.parse(user);
            setRole(userObject?.user?.role || "");
        }
    }, []);

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get(`http://localhost:5000/class/${classId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setClassData(response.data);

                if (role === "student") {
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user && user.user && user.user._id) {
                        const isStudentEnrolled = response.data.students.some(
                            (student) => student.id === user.user.id
                        );
                        setIsEnrolled(isStudentEnrolled);
                        if (!isStudentEnrolled) {
                            setShowEnrollModal(true);
                        }
                    } else {
                        setError("Invalid user data in localStorage");
                    }
                }

                setIsLoading(false);
            } catch (err) {
                if (err.response?.status === 401) {
                    setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    navigate('/login');
                } else if (err.response?.status === 404) {
                    setError("Không tìm thấy lớp học.");
                } else {
                    setError(err.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu lớp học.");
                }
                setIsLoading(false);
            }
        };

        if (role) {
            fetchClassData();
        }
    }, [classId, role]);

    useEffect(() => {
        const fetchClassMembers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get(`http://localhost:5000/class/${classId}/member`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setStudents(response.data);
            } catch (error) {
                console.error("Error fetching class members:", error);
                setError(error.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách học viên.");
            }
        };

        fetchClassMembers();
    }, [classId]);

    useEffect(() => {
        const fetchClassDocuments = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get(`http://localhost:5000/class/${classId}/document`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setDocuments(response.data);
            } catch (error) {
                console.error("Error fetching class documents:", error);
                setError(error.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách tài liệu.");
            }
        };

        fetchClassDocuments();
    }, [classId]);

    useEffect(() => {
        const fetchClassAssignments = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get(`http://localhost:5000/class/${classId}/assignment`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAssignments(response.data);
            } catch (error) {
                console.error("Error fetching class assignments:", error);
                setError(error.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách bài tập.");
            }
        };

        fetchClassAssignments();
    }, [classId]);

    const downloadDocument = async (documentId, fileName) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.get(`http://localhost:5000/api/download/${documentId}`, {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName.split('_').slice(1).join('_'));
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
            setError(error.response?.data?.message || "Đã xảy ra lỗi khi tải tài liệu.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadAttachment = async (assignmentId, attachmentId, fileName) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.get(`http://localhost:5000/assignment/download/${assignmentId}/attachment/${attachmentId}`, {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading attachment:', error);
            setError(error.response?.data?.message || "Đã xảy ra lỗi khi tải tệp đính kèm.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnrollClass = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            await axios.put(`http://localhost:5000/class/enroll/${classId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setIsEnrolled(true);
            setShowEnrollModal(false);

            const response = await axios.get(`http://localhost:5000/class/${classId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassData(response.data);
        } catch (error) {
            console.error("Error enrolling in class:", error);
            if (error.response?.status === 403) {
                setError("Chỉ học sinh mới có thể đăng ký lớp học.");
            } else if (error.response?.status === 400) {
                setError("Bạn đã đăng ký lớp học này rồi.");
            } else {
                setError(error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký lớp học.");
            }
        }
    };

    const handleCloseEnrollModal = () => {
        setShowEnrollModal(false);
        navigate('/classes');
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        setSubmissionError(null);
        setError('');

        if (!submissionFile) {
            setSubmissionError("Vui lòng chọn tệp để nộp.");
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        if (!allowedTypes.includes(submissionFile.type)) {
            setSubmissionError("Chỉ chấp nhận các định dạng PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX.");
            return;
        }

        if (submissionFile.size > 20 * 1024 * 1024) {
            setSubmissionError("Tệp phải nhỏ hơn 20MB.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const formData = new FormData();
            formData.append("submissionFile", submissionFile);
            formData.append("assignmentId", currentAssignment._id);

            await axios.post(`http://localhost:5000/submission/submissions`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setIsModalOpen(false);
            setSubmissionFile(null);
            setCurrentAssignment(null);
            setSubmissionError(null);

            const response = await axios.get(`http://localhost:5000/class/${classId}/assignment`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAssignments(response.data);
        } catch (error) {
            console.error("Error submitting assignment:", error);
            if (error.response?.status === 400) {
                setSubmissionError(error.response.data.message || "Đã quá hạn nộp bài hoặc dữ liệu không hợp lệ.");
            } else if (error.response?.status === 403) {
                setSubmissionError("Chỉ học sinh mới có thể nộp bài.");
            } else {
                setSubmissionError(error.response?.data?.message || "Đã xảy ra lỗi khi nộp bài.");
            }
            setError(error.response?.data?.message || "Đã xảy ra lỗi khi nộp bài.");
        }
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <Loading />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <Error message={error} />
            </>
        );
    }

    if (!classData) {
        return (
            <div className="error-container">
                <p>Không tìm thấy thông tin lớp học</p>
                <Link to="/classes" className="btn-back">
                    <FaArrowLeft /> Quay lại danh sách lớp học
                </Link>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="class-detail-container">
                <ClassHeader classData={classData} />
                <div className="class-detail-info">
                    <ClassInfoCard classData={classData} role={role} />
                </div>
                {showEnrollModal && role === 'student' && !isEnrolled && (
                    <EnrollModal
                        onEnroll={handleEnrollClass}
                        onClose={handleCloseEnrollModal}
                    />
                )}
                <ClassTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    role={role}
                />
                <div className="class-detail-content">
                    {activeTab === 'overview' && (
                        <OverviewTab classData={classData} role={role} />
                    )}
                    {activeTab === 'assignments' && (
                        <AssignmentsTab
                            assignments={assignments}
                            role={role}
                            downloadAttachment={downloadAttachment}
                            setCurrentAssignment={setCurrentAssignment}
                            setIsModalOpen={setIsModalOpen}
                        />
                    )}
                    {activeTab === 'documents' && (
                        <DocumentsTab
                            documents={documents}
                            downloadDocument={downloadDocument}
                        />
                    )}
                    {activeTab === 'students' && role === "teacher" && (
                        <StudentsTab students={students} />
                    )}
                    {isModalOpen && role === "student" && (
                        <SubmissionModal
                            currentAssignment={currentAssignment}
                            submissionError={submissionError}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSubmissionFile(null);
                                setSubmissionError(null);
                            }}
                            onSubmit={handleSubmitAssignment}
                            onFileChange={(e) => setSubmissionFile(e.target.files[0])}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default ClassDetail;