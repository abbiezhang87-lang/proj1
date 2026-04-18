import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { setCredentials } from '../../features/authSlice.js';
import axios from '../../utils/axios';
import AuthFormCustom from '../../features/authFormCustom.jsx';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (values) => {
        try {

            const response = await axios.post('/users/signin', values);

            if (response.status === 200) {
                const result = response.data;

                localStorage.setItem('token', result.token);
                localStorage.setItem('userId', result.userId);

                dispatch(setCredentials({
                    user: result.user,
                    isAdmin: result.role === 'Admin',
                }));

                message.success("Welcome back!");
                navigate('/');
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div style={{ background: '#F9FAFB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AuthFormCustom
                buttonText="Sign In"
                onFinish={handleLogin}
            />
        </div>
    );
};

export default LoginPage;