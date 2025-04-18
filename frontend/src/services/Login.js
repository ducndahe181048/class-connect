import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import "../css/Login.css";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [ipAddress, setIpAddress] = useState('');
    const navigate = useNavigate();

    // Fetch the user's IP address
    // useEffect(() => {
    //     const fetchIpAddress = async () => {
    //         try {
    //             const res = await axios.get('https://api.ipify.org?format=json');
    //             setIpAddress(res.data.ip);
    //         } catch (error) {
    //             console.error('Failed to fetch IP address:', error);
    //         }
    //     };
    //     fetchIpAddress();
    // }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/auth/login", { username, password });
            const { accessToken, user } = res.data;

            if (accessToken) {
                localStorage.setItem("token", accessToken);
                localStorage.setItem("user", JSON.stringify(res.data));
                navigate("/dashboard");
                // console.log('Login attempted', { user });
                // console.log('IP Address', ipAddress)
            } else {
                console.error("No accessToken received");
            }
        } catch (error) {
            setMessage(error.response?.data?.error || "Đăng nhập thất bại");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <h2 className="login-title">Chào mừng đến với ClassConnect</h2>
                    <p className="login-subtitle">Đăng nhập vào tài khoản của bạn</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Tên đăng nhập / Email
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="Nhập tên đăng nhập / Email của bạn"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mật khẩu
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
                                onClick={togglePasswordVisibility}
                                className="password-toggle-btn"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="remember-forgot-section">
                        {/* <div className="remember-section">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="remember-checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember-me">
                                Remember me
                            </label>
                        </div> */}
                        <Link to="/forgot-password" className="forgot-password-link">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <div className='error-message'>
                        {message}
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                    >
                        Đăng nhập
                    </button>
                </form>
                <div className="signup-section">
                    <p className="signup-text">
                        Không có tài khoản?{' '}
                        <Link to="/signup" className="signup-link">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;