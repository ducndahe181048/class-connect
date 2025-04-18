import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import CityList from "../services/CityList";
import axios from 'axios';
import "../css/Signup.css";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('');
    const [classroom, setClassroom] = useState('');
    const [school, setSchool] = useState('');
    const [dob, setDob] = useState('');
    const [city, setCity] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (password !== confirmPassword) {
                setMessage("Mật khẩu và xác nhận mật khẩu không khớp");
                return;
            }

            const res = await axios.post("http://localhost:5000/auth/signup",
                { fullname, email, classroom, school, dob, city, username, password, role });
            navigate("/login");
        } catch (error) {
            setMessage(error.response?.data?.error || "Signup failed");
        }
    };

    const togglePasswordVisibility = (type) => {
        if (type === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-wrapper">
                <div className="signup-header">
                    <h2 className="signup-title">Tạo tài khoản của bạn</h2>
                    <p className="signup-subtitle">Đăng ký để bắt đầu</p>
                </div>
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Tên đăng nhập (*)
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="Nhập tên đăng nhập của bạn"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fullname" className="form-label">
                            Họ và tên (*)
                        </label>
                        <input
                            id="fullname"
                            type="text"
                            required
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className="form-input"
                            placeholder="Nhập họ và tên của bạn"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email (*)
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="Nhập địa chỉ email của bạn"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role" className="form-label">
                            Vai trò (*)
                        </label>
                        <select
                            id="role"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Chọn vai trò</option>
                            <option value="student">Học sinh</option>
                            <option value="teacher">Giáo viên</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="school" className="form-label">
                                Trường học
                            </label>
                            <input
                                id="school"
                                type="text"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                className="form-input"
                                placeholder="Nhập tên trường học"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="classroom" className="form-label">
                                Lớp học
                            </label>
                            <input
                                id="classroom"
                                type="text"
                                value={classroom}
                                onChange={(e) => setClassroom(e.target.value)}
                                className="form-input"
                                placeholder="Nhập tên lớp học"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dob" className="form-label">
                                Ngày sinh
                            </label>
                            <input
                                id="dob"
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="city" className="form-label">
                                Thành phố
                            </label>
                            <select
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="form-input"
                            >
                                <option value="">Chọn tỉnh / thành phố</option>
                                {CityList.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mật khẩu (*)
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="Nhập mật khẩu của bạn"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('password')}
                                className="password-toggle-btn"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password" className="form-label">
                            Nhập lại mật khẩu của bạn (*)
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input"
                                placeholder="Nhập lại mật khẩu"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm-password')}
                                className="password-toggle-btn"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className='mandatory-field'>
                        Lưu ý: Các mục có (*) là bắt buộc.
                    </div>
                    <div className='error-message'>
                        {message}
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                    >
                        Đăng ký
                    </button>
                </form>
                <div className="login-section">
                    <p className="login-text">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className='login-link'>
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;