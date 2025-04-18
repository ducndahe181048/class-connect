import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSendResetRequest = async (e) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:5000/auth/forgot-password', { email });
            navigate('/check-email', {
                state: {
                    email,
                    message: 'Kiểm tra email để đặt lại mật khẩu.'
                }
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại email của bạn và thử lại.');
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <h2 className="login-title">Quên Mật Khẩu</h2>
                    <p className="login-subtitle">Nhập email để đặt lại mật khẩu</p>
                </div>
                <form onSubmit={handleSendResetRequest} className="login-form">
                    <div className="form-group">
                        <label htmlFor="reset-email" className="form-label">
                            Email
                        </label>
                        <input
                            id="reset-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="Nhập email của bạn"
                        />
                    </div>
                    <div className='error-message'>
                        {error}
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                    >
                        Gửi Yêu Cầu Đặt Lại Mật Khẩu
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

export default ForgotPassword;