import React, { useState, useEffect } from 'react';
import {
  FaBook,
  FaClipboardList,
  FaRegCalendarAlt,
  FaUsers,
  FaFileUpload,
  FaCloudDownloadAlt,
  FaUserGraduate,
  FaFileAlt,
  FaEdit,
  FaCalendarCheck
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import '../css/Dashboard.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObject = JSON.parse(storedUser);
        setFullname(userObject?.user?.fullname || "N/A");
        setRole(userObject?.user?.role || "");

        // After setting the role, fetch stats
        fetchUserStats(userObject?.user?.id, userObject?.user?.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchUserStats = async (userId, userRole) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = userRole === 'teacher'
        ? 'http://localhost:5000/statistic/dashboard/teacher'
        : 'http://localhost:5000/statistic/dashboard/student';

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setStats(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setIsLoading(false);
    }
  };

  // Teacher-specific statistics
  const teacherStats = [
    {
      name: 'Lớp học',
      icon: <FaUsers />,
      value: stats.classCount || 0,
      description: 'Lớp học đang quản lý',
      path: '/classes'
    },
    {
      name: 'Học viên',
      icon: <FaUserGraduate />,
      value: stats.totalStudents || 0,
      description: 'Tổng số học viên',
      path: '/teacher/students'
    },
    {
      name: 'Tài liệu',
      icon: <FaFileUpload />,
      value: stats.documentCount || 0,
      description: 'Tài liệu đã tải lên',
      path: '/upload'
    },
    {
      name: 'Bài tập',
      icon: <FaClipboardList />,
      value: stats.assignmentCount || 0,
      description: 'Bài tập đã tạo',
      path: '/teacher/assignments'
    },
    {
      name: 'Bài nộp của học sinh',
      icon: <FaFileAlt />,
      value: stats.submissionCount || 0,
      description: 'Chấm diểm bài tập',
      path: '/teacher/grade'
    },
    {
      name: 'Lịch dạy',
      icon: <FaRegCalendarAlt />,
      value: stats.incomingSchedules || 0,
      description: 'Lớp học sắp tới',
      path: '/schedule'
    }
  ];

  // Student-specific statistics
  const studentStats = [
    {
      name: 'Lớp học đã tham gia',
      icon: <FaBook />,
      value: stats.classCount || 0,
      description: 'Các lớp học đang theo học',
      path: '/classes'
    },
    {
      name: 'Tài liệu học tập',
      icon: <FaCloudDownloadAlt />,
      value: stats.documentCount || 0,
      description: 'Tài liệu có thể truy cập',
      path: '/upload'
    },
    {
      name: 'Bài tập',
      icon: <FaEdit />,
      value: stats.assignmentCount || 0,
      description: 'Bài tập được giao',
      path: '/student/assignments'
    },
    {
      name: 'Lịch học',
      icon: <FaCalendarCheck />,
      value: stats.incomingSchedules || 0,
      description: 'Buổi học sắp tới',
      path: '/schedule'
    }
  ];

  // Select stats based on role
  const displayStats = role === 'teacher' ? teacherStats : studentStats;

  // Render loading state
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
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Xin chào, {fullname}</h1>
            <p>Vai trò: {role === 'student' ? 'Học viên' : 'Giảng viên'}</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {displayStats.map((stat, index) => (
            <Link
              to={stat.path}
              key={index}
              className="dashboard-stat"
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-name">{stat.name}</span>
                <p className="stat-description">{stat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;