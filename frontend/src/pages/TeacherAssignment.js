import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/TeacherAssignment/TeacherAssignment.css';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import AssignmentList from '../components/TeacherAssignment/AssignmentList';
import AssignmentForm from '../components/TeacherAssignment/AssignmentForm';
import AssignmentView from '../components/TeacherAssignment/AssignmentView';
import DeleteConfirmationModal from '../components/TeacherAssignment/DeleteConfirmationModal';
import SearchFilterBar from '../components/SearchFilterBar';
import Header from '../components/TeacherAssignment/Header';
import Pagination from '../components/Pagination';

const TeacherAssignment = () => {
    const [role, setRole] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewAssignment, setViewAssignment] = useState(null);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const [currentAssignment, setCurrentAssignment] = useState({
        title: '',
        description: '',
        dueDate: '',
        classId: '',
        attachments: [],
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch user role when component mounts
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

    // Fetch data when role is available
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

            // Fetch assignments and classes concurrently
            const [assignmentsResponse, classesResponse] = await Promise.all([
                axios.get(`http://localhost:5000/assignment/assignments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/class/teacher`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setAssignments(assignmentsResponse.data);
            setClasses(classesResponse.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewAssignment = () => {
        setCurrentAssignment({
            title: '',
            description: '',
            dueDate: '',
            classId: '',
            attachments: [],
        });
        setShowForm(true);
    };

    const handleEdit = (assignment) => {
        // Format date for the form
        const dueDate = new Date(assignment.dueDate);
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(dueDate.getDate()).padStart(2, '0');
        const hours = String(dueDate.getHours()).padStart(2, '0');
        const minutes = String(dueDate.getMinutes()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

        // Extract the classId correctly whether it's an object or string
        const classId = typeof assignment.classId === 'object' ? assignment.classId._id : assignment.classId;

        setCurrentAssignment({
            ...assignment,
            dueDate: formattedDate,
            classId: classId,
            attachments: []
        });
        setShowForm(true);
    };

    const handleView = (assignment) => {
        setViewAssignment(assignment);
        setShowViewModal(true);
    };

    const handleSaveAssignment = async (formData) => {
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No authentication token found");
                return;
            }

            if (formData.get('_id')) {
                // Update existing assignment
                const id = formData.get('_id');
                formData.delete('_id'); // Remove _id from formData
                await axios.put(`http://localhost:5000/assignment/assignments/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                // Create new assignment
                await axios.post(`http://localhost:5000/assignment/assignments`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            // Reset form and refetch data
            setShowForm(false);
            setCurrentAssignment({
                title: '',
                description: '',
                dueDate: '',
                classId: '',
                attachments: [],
            });
            fetchData();
        } catch (err) {
            console.error('Error saving assignment:', err);
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu bài tập. Vui lòng thử lại sau.');
        }
    };

    const confirmDelete = (id) => {
        setAssignmentToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!assignmentToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/assignment/assignments/${assignmentToDelete}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Update the state after successful deletion
            setAssignments(assignments.filter(assignment => assignment._id !== assignmentToDelete));
            setDeleteModalOpen(false);
            setAssignmentToDelete(null);
        } catch (err) {
            console.error('Error deleting assignment:', err);
            setError('Đã xảy ra lỗi khi xóa bài tập. Vui lòng thử lại sau.');
        }
    };

    const handleDeleteAttachment = async (assignmentId, attachmentId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/assignment/assignments/${assignmentId}/attachments/${attachmentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Update the view assignment to remove the deleted attachment
            if (viewAssignment && viewAssignment._id === assignmentId) {
                setViewAssignment({
                    ...viewAssignment,
                    attachments: viewAssignment.attachments.filter(a => a._id !== attachmentId)
                });
            }

            // Also update the assignments list
            setAssignments(assignments.map(a => {
                if (a._id === assignmentId) {
                    return {
                        ...a,
                        attachments: a.attachments.filter(att => att._id !== attachmentId)
                    };
                }
                return a;
            }));

            setLoading(false);
        } catch (error) {
            console.error('Error deleting attachment:', error);
            setError('Đã xảy ra lỗi khi xóa tệp đính kèm. Vui lòng thử lại sau.');
            setLoading(false);
        }
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

    const getClassName = (classId) => {
        if (!classId) return 'N/A';
        if (typeof classId === 'object' && classId.name) return classId.name;

        const foundClass = classes.find(cls => cls._id === classId);
        return foundClass ? foundClass.name : 'N/A';
    };

    useEffect(() => {
        let filtered = assignments;

        if (selectedClass !== 'all') {
            filtered = filtered.filter(assignment => assignment.classId && assignment.classId._id === selectedClass);
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

    // Render loading state
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
                <Header onCreateNewAssignment={handleCreateNewAssignment} />

                <div className="classes-navigation">
                    <Link to="/dashboard" className="back-link">
                        <FaArrowLeft /> Quay lại
                    </Link>
                </div>

                {error && <div className="error-message">{error}</div>}

                <SearchFilterBar
                    searchPlaceholder="Tìm kiếm bài tập ..."
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    filterOptions={classes}
                    selectedFilter={selectedClass}
                    onFilterChange={handleClassChange}
                    filterPlaceholder="Tất cả lớp học"
                />

                <AssignmentList
                    assignments={currentAssignments}
                    getClassName={getClassName}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                    searchTerm={searchTerm}
                    selectedClass={selectedClass}
                />

                <Pagination
                    totalItems={filteredAssignments.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />

                {showForm && (
                    <AssignmentForm
                        assignment={currentAssignment}
                        classes={classes}
                        onSave={handleSaveAssignment}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {showViewModal && viewAssignment && (
                    <AssignmentView
                        assignment={viewAssignment}
                        getClassName={getClassName}
                        onClose={() => setShowViewModal(false)}
                        onEdit={() => {
                            setShowViewModal(false);
                            handleEdit(viewAssignment);
                        }}
                        onDownloadAttachment={handleDownloadAttachment}
                        onDeleteAttachment={handleDeleteAttachment}
                    />
                )}

                <DeleteConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa"
                    message="Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác."
                />
            </div>
        </>
    );
};

export default TeacherAssignment;