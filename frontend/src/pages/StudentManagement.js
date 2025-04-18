import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import '../css/StudentManagement/StudentManagement.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import SearchFilterBar from '../components/SearchFilterBar';
import StudentTable from '../components/StudentManagement/StudentTable';
import Pagination from '../components/Pagination';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const userObject = JSON.parse(storedUser);
            if (userObject?.user?.role !== "teacher") {
                setError("Chỉ giáo viên mới có thể truy cập trang này.");
                navigate('/dashboard');
                return;
            }
        } else {
            setError("Vui lòng đăng nhập để truy cập.");
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Vui lòng đăng nhập để xem danh sách học viên.");
                    navigate('/login');
                    return;
                }

                const [classesResponse, studentsResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/class/teacher`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get(`http://localhost:5000/class/teacher/all-students`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                setClasses(classesResponse.data);
                setStudents(Array.isArray(studentsResponse.data.students) ? studentsResponse.data.students : []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                if (err.response?.status === 401) {
                    setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    navigate('/login');
                } else if (err.response?.status === 403) {
                    setError("Chỉ giáo viên mới có thể truy cập danh sách học viên.");
                    navigate('/dashboard');
                } else {
                    setError(err.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu.");
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        let filtered = students;

        if (selectedClass !== 'all') {
            filtered = filtered.filter(student => Array.isArray(student.classId) && student.classId.includes(selectedClass));
        }

        if (searchTerm) {
            filtered = filtered.filter(student =>
                (student.fullname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredStudents(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [students, selectedClass, searchTerm]);

    const handleClassChange = (value) => {
        setSelectedClass(value);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    // Calculate paginated
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) {
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
                <div className="student-management-container">
                    <div className="error-message">{error}</div>
                    <Link to="/dashboard" className="back-link">
                        <FaArrowLeft /> Quay lại
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="student-management-container">
                <div className="student-management-header">
                    <div className="header-title">
                        <FaUserGraduate className="header-icon" />
                        <h1>Quản lý Học viên</h1>
                    </div>
                </div>
                <div className="classes-navigation">
                    <Link to="/dashboard" className="back-link">
                        <FaArrowLeft /> Quay lại
                    </Link>
                </div>
                <SearchFilterBar
                    searchPlaceholder="Tìm kiếm học viên ..."
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    filterOptions={classes}
                    selectedFilter={selectedClass}
                    onFilterChange={handleClassChange}
                    filterPlaceholder="Tất cả lớp học"
                />
                <StudentTable students={currentStudents} />
                <Pagination
                    totalItems={filteredStudents.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </>
    );
};

export default StudentManagement;