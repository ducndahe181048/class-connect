import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaLock, FaEnvelope, FaSchool, FaBirthdayCake, FaArrowLeft, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CityList from "../services/CityList";
import "../css/UserProfile.css";
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';

const Profile = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [userData, setUserData] = useState({
        fullname: '',
        email: '',
        username: '',
        password: '',
        role: '',
        school: '',
        classroom: '',
        dob: '',
        city: ''
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const userObject = JSON.parse(storedUser);
                setUserData({
                    fullname: userObject?.user?.fullname || "N/A",
                    email: userObject?.user?.email || "N/A",
                    username: userObject?.user?.username || "N/A",
                    password: userObject?.user?.password || "N/A",
                    role: userObject?.user?.role || "N/A",
                    school: userObject?.user?.school || "Chưa cập nhật",
                    classroom: userObject?.user?.classroom || "Chưa cập nhật",
                    dob: userObject?.user?.dob ?
                        new Date(userObject.user.dob).toISOString().split('T')[0] :
                        "",
                    city: userObject?.user?.city || "Chưa cập nhật"
                });
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("user");
        }
    }, []);

    const handleEditUserInfo = (userData) => {
        setError('');
        setSuccess('');
        setWarning('');
        setUserData(userData);
        setIsModalOpen(true);
    };

    const handleSaveUserInfo = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setWarning('');

        if (!userData.fullname || !userData.email) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            setError('Vui lòng nhập email hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (!token || !storedUser) {
                throw new Error('Không tìm thấy thông tin đăng nhập');
            }

            // Prepare the data to send
            const updateData = {
                fullname: userData.fullname,
                email: userData.email,
                school: userData.school || '',
                classroom: userData.classroom || '',
                dob: userData.dob || '',
                city: userData.city || ''
            };

            // Make API call to update user information
            const response = await axios.put(
                `http://localhost:5000/user/${storedUser.user._id}`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Merge the updated data with existing user data
            const updatedUserData = {
                ...storedUser.user,
                ...response.data
            };

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify({
                user: updatedUserData
            }));

            // Close modal
            setSuccess('Cập nhật thông tin thành công');
            setIsModalOpen(false);

        } catch (err) {
            setError('Cập nhật thông tin không thành công.');
            console.error('Error updating user:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditUserPassword = () => {
        setError('');
        setSuccess('');
        setWarning('');
        setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsPasswordModalOpen(true);
    };

    const handleSaveUserPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setWarning('');

        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@])[A-Za-z\d#?!@]{8,}$/;
        // if (!passwordRegex.test(passwordData.newPassword)) {
        //     setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái viết hoa và thường, số, và kí tự đặc biệt (# ? ! @)');
        //     return;
        // }

        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin mật khẩu');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        if (passwordData.oldPassword === passwordData.newPassword) {
            setWarning('Mật khẩu mới trùng với mật khẩu cũ. Hãy chọn một mật khẩu khác');
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (!token || !storedUser) {
                throw new Error('Không tìm thấy thông tin đăng nhập');
            }

            // Prepare the data to send
            const updateData = {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            };

            // Make API call to update user password
            const response = await axios.put(
                `http://localhost:5000/auth/change-password/${storedUser.user._id}`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Merge the updated data with existing user data
            const updatedPasswordData = {
                ...storedUser.user,
                ...response.data
            };

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify({
                user: updatedPasswordData
            }));

            // Close modal
            setSuccess('Cập nhật mật khẩu thành công. Chuyển hướng đến trang đăng nhập...');
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError('Đã xảy ra lỗi! Vui lòng kiểm tra lại mật khẩu hiện tại');
            console.error('Error updating password:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'oldPassword') {
            setShowOldPassword(!showOldPassword);
        } else if (field === 'newPassword') {
            setShowNewPassword(!showNewPassword);
        } else if (field === 'confirmPassword') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const profileFeatures = [
        {
            name: 'Chỉnh sửa Hồ sơ',
            icon: <FaEdit />,
            description: 'Cập nhật thông tin cá nhân',
            onclick: () => handleEditUserInfo(userData),
        },
        {
            name: 'Đổi Mật khẩu',
            icon: <FaLock />,
            description: 'Thay đổi mật khẩu của bạn',
            onclick: () => handleEditUserPassword(),
        },
        {
            name: 'Đăng xuất',
            icon: <FaLock />,
            description: 'Đăng xuất khỏi tài khoản',
            onclick: () => handleLogout(),
        }
    ];

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
                        <h1>Hồ Sơ Cá Nhân</h1>
                        <p>Thông tin chi tiết của bạn</p>
                    </div>
                </div>

                <div className="dashboard-navigation">
                    <Link to="/dashboard" className="back-link">
                        <FaArrowLeft /> Quay lại
                    </Link>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-feature">
                        <div className="feature-icon"><FaUser /></div>
                        <div className="feature-content">
                            <span className="feature-name">Thông Tin Cơ Bản</span>
                            <p className="feature-description">
                                <strong>Họ và Tên:</strong> {userData.fullname}<br />
                                <strong>Tên Đăng Nhập:</strong> {userData.username}<br />
                                <strong>Vai Trò:</strong> {userData.role === 'student' ? 'Học Viên' : 'Giảng Viên'}
                            </p>
                        </div>
                    </div>

                    <div className="dashboard-feature">
                        <div className="feature-icon"><FaEnvelope /></div>
                        <div className="feature-content">
                            <span className="feature-name">Thông Tin Liên Hệ</span>
                            <p className="feature-description">
                                <strong>Email:</strong> {userData.email}<br />
                                <strong>Thành Phố:</strong> {userData.city}
                            </p>
                        </div>
                    </div>

                    <div className="dashboard-feature">
                        <div className="feature-icon"><FaSchool /></div>
                        <div className="feature-content">
                            <span className="feature-name">Thông Tin Học Tập</span>
                            <p className="feature-description">
                                <strong>Trường:</strong> {userData.school}<br />
                                <strong>Lớp:</strong> {userData.classroom}
                            </p>
                        </div>
                    </div>

                    <div className="dashboard-feature">
                        <div className="feature-icon"><FaBirthdayCake /></div>
                        <div className="feature-content">
                            <span className="feature-name">Ngày Sinh</span>
                            <p className="feature-description">{new Date(userData.dob).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>

                    {profileFeatures.map((feature, index) => (
                        feature.path ? (
                            <Link
                                to={feature.path}
                                key={index}
                                className="dashboard-feature"
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <div className="feature-content">
                                    <span className="feature-name">{feature.name}</span>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            </Link>
                        ) : (
                            <div
                                key={index}
                                className="dashboard-feature"
                                onClick={feature.onclick}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <div className="feature-content">
                                    <span className="feature-name">{feature.name}</span>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {/* Modal for editing user information */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Chỉnh sửa thông tin cá nhân</h2>

                            <form onSubmit={handleSaveUserInfo}>
                                <div className="form-group">
                                    <label>Họ và tên (*)</label>

                                    <input
                                        type="text"
                                        value={userData.fullname}
                                        className='form-input'
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            fullname: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email (*)</label>

                                    <input
                                        type="email"
                                        value={userData.email}
                                        className='form-input'
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            email: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Trường</label>

                                    <input
                                        type="text"
                                        value={userData.school}
                                        className='form-input'
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            school: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Lớp</label>

                                    <input
                                        type="text"
                                        value={userData.classroom}
                                        className='form-input'
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            classroom: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ngày sinh</label>

                                    <input
                                        type="date"
                                        value={userData.dob}
                                        className='form-input'
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            dob: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="city" className="form-label">
                                        Thành phố
                                    </label>

                                    <select
                                        id="city"
                                        value={userData.city}
                                        onChange={(e) => setUserData({
                                            ...userData,
                                            city: e.target.value
                                        })}
                                        className="form-input"
                                    >
                                        <option value="">Chọn tỉnh / thành phố</option>
                                        {CityList.map((city, index) => (
                                            <option key={index} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='mandatory-field'>
                                    Lưu ý: Các mục có (*) là bắt buộc.
                                </div>

                                {error && <p className="error-message">{error}</p>}
                                {success && <p className="success-message">{success}</p>}

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-save"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Đang Lưu...' : 'Lưu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal for change user password */}
                {isPasswordModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Thay đổi mật khẩu</h2>
                            <form onSubmit={handleSaveUserPassword}>
                                <div className="form-group">
                                    <label>Nhập mật khẩu cũ (*)</label>

                                    <div className="password-input-wrapper">
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            value={passwordData.oldPassword}
                                            className="form-input"
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                oldPassword: e.target.value
                                            })}
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('oldPassword')}
                                            className="password-toggle-btn"
                                            aria-label={showOldPassword ? "Hide password" : "Show password"}
                                        >
                                            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Nhập mật khẩu mới (*)</label>

                                    <div className="password-input-wrapper">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            className='form-input'
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                newPassword: e.target.value
                                            })}
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                            className="password-toggle-btn"
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới (*)</label>

                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            className='form-input'
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                confirmPassword: e.target.value
                                            })}
                                            required
                                        />

                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
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

                                {error && <p className="error-message">{error}</p>}
                                {success && <p className="success-message">{success}</p>}
                                {warning && <p className="warning-message">{warning}</p>}

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setIsPasswordModalOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-save"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Đang Lưu...' : 'Lưu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Profile;