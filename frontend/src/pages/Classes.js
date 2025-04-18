import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import Error from '../components/Error';
import ClassesHeader from '../components/Classes/ClassesHeader';
import SearchBar from '../components/Classes/SearchBar';
import ClassesGrid from '../components/Classes/ClassesGrid';
import ClassModal from '../components/Classes/ClassModal';
import DeleteConfirmationModal from '../components/Classes/DeleteConfirmationModal';
import { FaBook } from 'react-icons/fa';
import '../css/Classes/Classes.css';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [currentClass, setCurrentClass] = useState({
        name: '',
        description: '',
        startDate: '',
        numberOfStudents: 0,
        students: [],
        lessons: [],
        assignments: [],
        documents: [],
    });
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const userObject = JSON.parse(user);
            setRole(userObject?.user?.role || "");
        } else {
            setError("No user data found");
            setIsLoading(false);
        }
    }, []);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }
            const endpoint = role === "teacher" ? "http://localhost:5000/class/teacher" : "http://localhost:5000/class/student";
            const response = await axios.get(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClasses(response.data);
            setIsLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (role) {
            fetchClasses();
        }
    }, [role]);

    const handleAddClass = () => {
        setCurrentClass({
            name: '',
            description: '',
            startDate: '',
            numberOfStudents: 0,
            students: [],
            lessons: [],
            assignments: [],
            documents: [],
        });
        setIsModalOpen(true);
    };

    const handleEditClass = (classItem) => {
        setCurrentClass(classItem);
        setIsModalOpen(true);
    };

    const handleSaveClass = async () => {
        try {
            const token = localStorage.getItem('token');
            if (currentClass._id) {
                const response = await axios.put(`http://localhost:5000/class/${currentClass._id}`, currentClass, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setClasses(classes.map(cls => cls._id === currentClass._id ? response.data : cls));
            } else {
                const response = await axios.post('http://localhost:5000/class/create', currentClass, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setClasses([...classes, response.data]);
            }
            setIsModalOpen(false);
            setCurrentClass({
                name: '',
                description: '',
                startDate: '',
                numberOfStudents: 0,
                students: [],
                lessons: [],
                assignments: [],
                documents: [],
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể lưu lớp học');
        }
    };

    const openDeleteModal = (_class) => {
        setCurrentClass(_class);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleDeleteClass = async (classId) => {
        try {
            setIsLoading(true);
            await axios.delete(`http://localhost:5000/class/${classId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            closeDeleteModal();
            fetchClasses();
            setIsLoading(false);
        } catch (error) {
            console.error("Delete error:", error);
            setIsLoading(false);
        }
    };

    const handleEnrollClass = () => {
        navigate("/student/join-class");
    };

    const filteredClasses = classes.filter((_class) => {
        const searchTerm = search.toLowerCase();
        return (
            _class._id?.toLowerCase().includes(searchTerm) ||
            _class.name.toLowerCase().includes(searchTerm) ||
            _class.description?.toLowerCase().includes(searchTerm)
        );
    });

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
                <Error />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="classes-container">
                <ClassesHeader role={role} handleAddClass={handleAddClass} handleEnrollClass={handleEnrollClass} />
                <SearchBar search={search} setSearch={setSearch} />
                {classes.length === 0 ? (
                    <div className="no-classes">
                        <FaBook className="no-classes-icon" />
                        {role === "teacher" && <p>Bạn chưa có lớp học nào. Hãy thêm lớp học mới!</p>}
                        {role === "student" && <p>Bạn chưa có lớp học nào. Hãy tham gia lớp học!</p>}
                    </div>
                ) : (
                    <ClassesGrid
                        classes={filteredClasses}
                        role={role}
                        handleEditClass={handleEditClass}
                        openDeleteModal={openDeleteModal}
                    />
                )}
                <ClassModal
                    isOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(false)}
                    currentClass={currentClass}
                    setCurrentClass={setCurrentClass}
                    handleSaveClass={handleSaveClass}
                />
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    closeModal={closeDeleteModal}
                    currentClass={currentClass}
                    handleDeleteClass={handleDeleteClass}
                    isLoading={isLoading}
                />
            </div>
        </>
    );
};

export default Classes;