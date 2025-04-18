import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Upload/Upload.css';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import DocumentTable from '../components/Upload/DocumentTable';
import DocumentModal from '../components/Upload/DocumentModal';
import DeleteConfirmationModal from '../components/Upload/DeleteConfirmationModal';
import Header from '../components/Upload/Header';
import SearchFilterBar from '../components/SearchFilterBar';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Pagination from '../components/Pagination';

const Upload = () => {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        classId: '',
        file: null
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const userObject = JSON.parse(storedUser);
                setRole(userObject?.user?.role || "");
            } catch (error) {
                console.error("Error parsing user data:", error);
                setError("Dữ liệu người dùng không hợp lệ.");
            }
        }
    }, []);

    useEffect(() => {
        if (role) {
            fetchClasses();
            fetchDocuments();
        }
    }, [role]);

    const fetchClasses = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Vui lòng đăng nhập để xem danh sách lớp học.");
                navigate('/login');
                return;
            }
            const endpoint = role === 'teacher' ? 'http://localhost:5000/class/teacher' : 'http://localhost:5000/class/student';
            const response = await axios.get(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError(error.response?.data?.message || "Không thể tải danh sách lớp học.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Vui lòng đăng nhập để xem tài liệu.");
                navigate('/login');
                return;
            }
            const endpoint = role === 'teacher' ? 'http://localhost:5000/class/teacher/all-documents' : 'http://localhost:5000/class/student/all-documents';
            const response = await axios.get(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDocuments(Array.isArray(response.data.documents) ? response.data.documents : []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError(error.response?.data?.message || "Không thể tải danh sách tài liệu.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let filtered = documents;

        if (selectedClass !== 'all') {
            filtered = filtered.filter(doc => doc.classId.includes(selectedClass));
        }

        if (searchTerm) {
            filtered = filtered.filter(doc =>
                doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDocuments(filtered);
        setCurrentPage(1);
    }, [documents, selectedClass, searchTerm]);

    const handleClassChange = (value) => {
        setSelectedClass(value);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    const openModal = () => {
        setError('');
        setFormData({
            name: '',
            description: '',
            classId: selectedClass !== 'all' ? selectedClass : '',
            file: null
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setError('');
    };

    const openDeleteModal = (document) => {
        setCurrentDocument(document);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setError('');
    };

    const openEditModal = (document) => {
        setError('');
        setCurrentDocument(document);
        setFormData({
            name: document.name || document.title,
            description: document.description,
            classId: document.classId,
            file: null
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setError('');
    };

    const handleInputChange = (e) => {
        setError('');
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setError('');
        setFormData({
            ...formData,
            file: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.classId) {
            setError('Vui lòng điền đầy đủ tiêu đề và lớp học.');
            return;
        }
        if (!formData.file) {
            setError('Vui lòng chọn một tệp để tải lên.');
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
        if (!allowedTypes.includes(formData.file.type)) {
            setError('Chỉ chấp nhận các định dạng PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX.');
            return;
        }
        if (formData.file.size > 20 * 1024 * 1024) {
            setError('Tệp phải nhỏ hơn 20MB.');
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError('Vui lòng đăng nhập để tải lên tài liệu.');
                navigate('/login');
                return;
            }
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('classId', formData.classId);
            formDataToSend.append('file', formData.file);

            await axios.post('http://localhost:5000/api/upload', formDataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            closeModal();
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
            } else if (error.response?.status === 400) {
                setError(error.response.data.message || 'Dữ liệu không hợp lệ.');
            } else {
                setError(error.response?.data?.message || 'Đã xảy ra lỗi khi tải lên tài liệu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.classId) {
            setError('Vui lòng điền đầy đủ tiêu đề và lớp học.');
            return;
        }
        if (formData.file) {
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
            if (!allowedTypes.includes(formData.file.type)) {
                setError('Chỉ chấp nhận các định dạng PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX.');
                return;
            }
            if (formData.file.size > 20 * 1024 * 1024) {
                setError('Tệp phải nhỏ hơn 20MB.');
                return;
            }
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError('Vui lòng đăng nhập để chỉnh sửa tài liệu.');
                navigate('/login');
                return;
            }
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('classId', formData.classId);
            if (formData.file) {
                formDataToSend.append('file', formData.file);
            }

            await axios.put(`http://localhost:5000/api/${currentDocument._id}`, formDataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            closeEditModal();
            fetchDocuments();
        } catch (error) {
            console.error('Error updating document:', error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
            } else if (error.response?.status === 403) {
                setError('Chỉ giáo viên mới có thể chỉnh sửa tài liệu.');
            } else if (error.response?.status === 404) {
                setError('Không tìm thấy tài liệu.');
            } else {
                setError(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật tài liệu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError('Vui lòng đăng nhập để xóa tài liệu.');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:5000/api/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            closeDeleteModal();
            fetchDocuments();
        } catch (error) {
            console.error("Delete error:", error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
            } else if (error.response?.status === 403) {
                setError('Chỉ giáo viên mới có thể xóa tài liệu.');
            } else if (error.response?.status === 404) {
                setError('Không tìm thấy tài liệu.');
            } else {
                setError(error.response?.data?.message || 'Đã xảy ra lỗi khi xóa tài liệu.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const downloadDocument = async (documentId, fileName) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError('Vui lòng đăng nhập để tải tài liệu.');
                navigate('/login');
                return;
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
            setError(error.response?.data?.message || 'Đã xảy ra lỗi khi tải tài liệu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate paginated
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDocuments = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);

    if (isLoading) {
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
            <div className="upload-container">
                <Header
                    role={role}
                    onAddDocument={openModal}
                />
                <div className="classes-navigation">
                    <Link to="/dashboard" className="back-link">
                        <FaArrowLeft /> Quay lại
                    </Link>
                </div>
                <SearchFilterBar
                    searchPlaceholder="Tìm kiếm tài liệu ..."
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    filterOptions={classes}
                    selectedFilter={selectedClass}
                    onFilterChange={handleClassChange}
                    filterPlaceholder="Tất cả lớp học"
                />
                <DocumentTable
                    documents={currentDocuments}
                    role={role}
                    classes={classes}
                    onDownload={downloadDocument}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                />
                <Pagination
                    totalItems={filteredDocuments.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
                {role === "teacher" && (
                    <DocumentModal
                        show={showModal}
                        onClose={closeModal}
                        formData={formData}
                        onChange={handleInputChange}
                        onFileChange={handleFileChange}
                        onSubmit={handleSubmit}
                        classes={classes}
                        isLoading={isLoading}
                        error={error}
                    />
                )}
                {role === "teacher" && (
                    <DocumentModal
                        isEditing={true}
                        show={showEditModal}
                        onClose={closeEditModal}
                        formData={formData}
                        onChange={handleInputChange}
                        onFileChange={handleFileChange}
                        onSubmit={handleEdit}
                        classes={classes}
                        isLoading={isLoading}
                        error={error}
                        currentDocument={currentDocument}
                    />
                )}
                {role === "teacher" && (
                    <DeleteConfirmationModal
                        show={showDeleteModal}
                        document={currentDocument}
                        onClose={closeDeleteModal}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                        error={error}
                    />
                )}
            </div>
        </>
    );
};

export default Upload;