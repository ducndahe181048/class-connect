import React from 'react';
import { useNavigate } from 'react-router-dom';

function Error() {
    const navigate = useNavigate();

    const handleLoginAgain = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/login");
    };

    return (
        // Render error state
        <div className="classes-container">
            <div className="error-container">
                <p className='error-message'>Đã có lỗi xảy ra. Vui lòng đăng nhập lại ...</p>
                <button onClick={handleLoginAgain}>Đăng nhập lại</button>
            </div>
        </div>
    );
}

export default Error