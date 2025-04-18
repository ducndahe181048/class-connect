import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
    useEffect(() => {
        const logout = async () => {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                await axios.delete('http://localhost:5000/auth/logout', {
                    data: { token: refreshToken },
                });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');
            } catch (error) {
                console.error('Error during logout:', error);
            }
        };

        logout();
    }, []);

    return <Navigate to="/login" />;
};

export default Logout;