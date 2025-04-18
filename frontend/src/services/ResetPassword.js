import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import '../css/ResetPassword.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/auth/reset-password', {
                token,
                newPassword
            });

            setSuccess('Mật khẩu đã được đặt lại thành công.');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    return (
        <div className="reset-password-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <h2 className="login-title">Đặt Lại Mật Khẩu</h2>
                    <p className="login-subtitle">Nhập mật khẩu mới của bạn</p>
                </div>
                <form onSubmit={handleResetPassword} className="login-form">
                    <div className="form-group">
                        <label htmlFor="new-password" className="form-label">
                            Mật Khẩu Mới
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="form-input"
                                placeholder="Nhập mật khẩu mới"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="password-toggle-btn"
                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password" className="form-label">
                            Xác Nhận Mật Khẩu
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input"
                                placeholder="Nhập lại mật khẩu mới"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle-btn"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <button
                        type="submit"
                        className="submit-button"
                    >
                        Đặt Lại Mật Khẩu
                    </button>
                </form>
                <div className="back-to-login">
                    <Link to="/login" className="back-link">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;