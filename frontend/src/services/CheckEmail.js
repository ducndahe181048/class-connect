import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/CheckEmail.css';

const CheckEmail = () => {
    const location = useLocation();
    const { email, message } = location.state || {};

    return (
        <div className="check-email-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <h2 className="login-title">Kiểm Tra Email</h2>
                    <p className="login-subtitle">
                        {message || 'Chúng tôi đã gửi liên kết đặt lại mật khẩu'}
                    </p>
                </div>
                {email && (
                    <div className="email-info">
                        <p>Đã gửi đến: {email}</p>
                    </div>
                )}
                <div className="check-email-actions">
                    <p>Không nhận được email?</p>
                    <Link to="/forgot-password" className="resend-link">
                        Gửi lại email
                    </Link>
                </div>
                <div className="back-to-login">
                    <Link to="/login" className="back-link">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckEmail;