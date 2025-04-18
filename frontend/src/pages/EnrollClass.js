import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { FaChalkboardTeacher } from 'react-icons/fa';
import '../css/EnrollClass.css';
import Navbar from "../components/Navbar";

const EnrollClass = () => {
    const [code, setCode] = useState(["", "", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const [classDetail, setClassDetail] = useState(null);
    const token = localStorage.getItem('token');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (index, value) => {
        setError('');
        setSuccess('');
        setClassDetail(null);

        if (!/^[A-Za-z0-9]?$/.test(value)) return; // Allow only letters & numbers
        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);

        if (value && index < 4 && value.length === 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        const classCode = code.join("").trim();
        if (classCode.length !== 5) return setError("Hãy nhập đủ mã code gồm 5 kí tự!");

        try {
            const response = await axios.get(`http://localhost:5000/class/${classCode}`);
            if (response.data) {
                setClassDetail(response.data);
                setSuccess('Đã tìm thấy lớp học!')
            }

        } catch (error) {
            setError("Không thể tìm thấy lớp học. Hãy kiểm tra lại mã lớp!");
        }
    };

    const handleEnrollClass = async () => {
        setError('');
        setSuccess('');

        const classCode = code.join("").trim();
        if (classCode.length !== 5) return setError("Hãy nhập đủ mã code gồm 5 kí tự!");

        try {
            const res = await axios.put(`http://localhost:5000/class/enroll/${classCode}`,
                {},  // Empty body
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data) {
                setClassDetail(res.data);
                navigate(`/class/${classDetail._id}`);
            }
        } catch (error) {
            setError("Đã có lỗi xảy ra khi tham gia lớp học!");
        }
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="user-info">
                        <h1>Tham Gia Lớp Học</h1>
                        <p>Nhập mã lớp học để tham gia</p>
                    </div>
                    <Link to="/classes" className="go-back-toggle-btn">Quay lại</Link>
                </div>

                <div className="enroll-page">
                    <div className="inner-enroll-page">
                        <h4>Nhập mã lớp học gồm 5 kí tự</h4>
                        <div className="input-enroll-page">
                            {code.map((char, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    value={char}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                />
                            ))}
                        </div>

                        <button className="find-class" onClick={handleSubmit}>Tìm lớp học</button>
                    </div>

                    {error && (<div className="error-message">{error}</div>)}
                    {success && (<div className="success-message">{success}</div>)}
                    <br />

                    {classDetail && (
                        <div className="dashboard-feature full-width">
                            <div className="feature-icon"><FaChalkboardTeacher /></div>
                            <div className="feature-content">
                                <span className="feature-name">Chi Tiết Lớp Học</span>
                                <p className="feature-description">
                                    <strong>Tên Lớp:</strong> {classDetail.name || "N/A"}<br />
                                    <strong>Mã Lớp:</strong> {classDetail._id || "N/A"}<br />
                                    <strong>Mô Tả:</strong> {classDetail.description || "N/A"}<br />
                                    <strong>Giáo Viên:</strong> {classDetail.userId?.fullname || "N/A"}
                                </p>
                                <button
                                    className="feature-action-btn"
                                    onClick={handleEnrollClass}
                                >
                                    Tham Gia Lớp Học
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EnrollClass;