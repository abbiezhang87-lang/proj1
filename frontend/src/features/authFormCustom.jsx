import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import './authFormCustom.css';

const { Title, Text } = Typography;

/**
 * @param {string} buttonText - 'Sign In' 或 'Sign Up'
 * @param {function} onFinish - 提交表单后的逻辑回调（由 LoginPage 传入）
 */
const AuthFormCustom = ({ buttonText, onFinish }) => {
    const navigate = useNavigate();

    return (
        <Card
            className="auth-card"
            style={{
                width: 400,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                padding: '10px 20px'
            }}
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24, fontWeight: 600 }}>
                {buttonText === 'Sign In' ? 'Sign in to your account' : 'Create an account'}
            </Title>

            <Form
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
            >
                {/* Email 字段 */}
                <Form.Item
                    label={<Text strong>Email</Text>}
                    name="email"
                    rules={[
                        { required: true, message: 'Invalid Email input!' },
                        {
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email address!'
                        }
                    ]}
                >
                    <Input
                        placeholder="Enter email"
                        style={{ height: 42, borderRadius: 4 }}
                    />
                </Form.Item>

                {/* Password 字段：自带“小眼睛”切换逻辑，无需手写 useState */}
                <Form.Item
                    label={<Text strong>Password</Text>}
                    name="password"
                    rules={[
                        { required: true, message: 'Password is required!' },
                        { min: 6, message: 'Password must be at least 6 characters long!' }
                    ]}
                >
                    <Input.Password
                        placeholder="Enter password"
                        style={{ height: 42, borderRadius: 4 }}
                    />
                </Form.Item>

                <Form.Item style={{ marginTop: 24 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        style={{
                            height: 48,
                            backgroundColor: '#5e5adb',
                            borderColor: '#5e5adb',
                            fontSize: 16,
                            fontWeight: 600,
                            borderRadius: 4
                        }}
                    >
                        {buttonText}
                    </Button>
                </Form.Item>

                {/* 底部跳转链接 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                    {buttonText === 'Sign In' ? (
                        <>
                            <Text size="small">
                                Don't have an account? <a onClick={() => navigate('/signup')}>Sign up</a>
                            </Text>
                            <a onClick={() => navigate('/update-password')} style={{ fontSize: 12 }}>
                                Forgot password?
                            </a>
                        </>
                    ) : (
                        <Text size="small" style={{ textAlign: 'center', width: '100%' }}>
                            Already have an account? <a onClick={() => navigate('/signin')}>Sign in</a>
                        </Text>
                    )}
                </div>
            </Form>
        </Card>
    );
};

export default AuthFormCustom;