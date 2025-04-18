import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaHome,
    FaBook,
    FaUserAlt,
    FaFileAlt,
    FaBars,
    FaTimes,
    FaCalendarAlt,
    FaFileUpload,
    FaClipboardList
} from 'react-icons/fa';
import '../css/Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [fullname, setFullname] = useState("");
    const [role, setRole] = useState("");
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const userObject = JSON.parse(storedUser);
                setFullname(userObject?.user?.fullname || "N/A");
                setRole(userObject?.user?.role || "");
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    // Define navigation items based on role
    const teacherNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
        { name: 'Lớp học', path: '/classes', icon: <FaBook /> },
        { name: 'Học viên', path: '/teacher/students', icon: <FaUserAlt /> },
        { name: 'Tài liệu', path: '/upload', icon: <FaFileUpload /> },
        { name: 'Bài tập', path: '/teacher/assignments', icon: <FaClipboardList /> },
        { name: 'Chấm điểm', path: '/teacher/grade', icon: <FaFileAlt /> },
        { name: 'Lịch dạy', path: '/schedule', icon: <FaCalendarAlt /> },
    ];

    const studentNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
        { name: 'Lớp học', path: '/classes', icon: <FaBook /> },
        { name: 'Tài liệu', path: '/upload', icon: <FaFileUpload /> },
        { name: 'Bài tập', path: '/student/assignments', icon: <FaClipboardList /> },
        { name: 'Lịch học', path: '/schedule', icon: <FaCalendarAlt /> },
        { name: 'Hồ sơ', path: '/profile', icon: <FaUserAlt /> }
    ];

    const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

    // Check if a navigation item is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/dashboard" className="navbar-logo">
                        <span className="logo-text">ClassConnect</span>
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="navbar-menu">
                        {navItems.map((item, index) => (
                            <li key={index} className="navbar-item">
                                <Link
                                    to={item.path}

                                    className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    {item.icon}
                                    <span className='navbar-item-name'>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="navbar-user">
                        <Link to="/profile" className="avatar-link">
                            <div className="user-avatar">
                                {fullname ? fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </Link>
                        <div className="user-info-dropdown">
                            <div className="user-dropdown-content">
                                <div className="user-name">{fullname}</div>
                                <div className="user-role">{role === 'teacher' ? 'Giảng viên' : 'Học viên'}</div>
                                <div className="dropdown-divider"></div>
                                <Link to="/profile" className="dropdown-item">Hồ sơ</Link>
                                <Link to="/settings" className="dropdown-item">Cài đặt</Link>
                                <div className="dropdown-divider"></div>
                                <Link to="/logout" className="dropdown-item logout">Đăng xuất</Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="navbar-toggle" onClick={toggleMenu}>
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <div className="mobile-user-info">
                        <div className="mobile-avatar">
                            {fullname ? fullname.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <div className="mobile-fullname">{fullname}</div>
                            <div className="mobile-role">{role === 'teacher' ? 'Giảng viên' : 'Học viên'}</div>
                        </div>
                    </div>
                </div>
                <ul className="mobile-menu-items">
                    {navItems.map((item, index) => (
                        <li key={index} className="mobile-menu-item">
                            <Link
                                to={item.path}
                                className={`mobile-menu-link ${isActive(item.path) ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                    <div className="mobile-menu-divider"></div>
                    <li className="mobile-menu-item">
                        <Link to="/logout" className="mobile-menu-link logout" onClick={closeMenu}>
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Đăng xuất</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Navbar;