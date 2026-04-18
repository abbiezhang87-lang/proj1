import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { emailRules, passwordRules, nameRules } from '../utils/validators.js';
import './AuthForm.css';

const { Title, Text } = Typography;

/**
 * Reusable form for Sign In / Sign Up / Update Password.
 * Controlled by a single `mode` prop — matches Phase I requirement #1:
 * "three pages using one reusable component".
 *
 * Props:
 *   mode: 'signin' | 'signup' | 'update-password'
 *   onFinish: (values) => void
 *   loading: boolean
 *   errorText: string | null
 */
const AuthForm = ({ mode, onFinish, loading = false, errorText = null }) => {
  const navigate = useNavigate();
  const isSignIn = mode === 'signin';
  const isSignUp = mode === 'signup';
  const isUpdate = mode === 'update-password';

  const title = isSignIn
    ? 'Sign in to your account'
    : isSignUp
      ? 'Create an account'
      : 'Update your password';
  const buttonText = isSignIn
    ? 'Sign In'
    : isSignUp
      ? 'Sign Up'
      : 'Update Password';

  return (
    <div className="auth-wrap">
      <Card className="auth-card">
        <Title level={3} className="auth-title">
          {title}
        </Title>

        {errorText ? (
          <Alert
            type="error"
            showIcon
            message={errorText}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          {isSignUp && (
            <Form.Item label="Name" name="name" rules={nameRules}>
              <Input placeholder="Enter name" size="large" />
            </Form.Item>
          )}

          {(isSignIn || isSignUp) && (
            <Form.Item label="Email" name="email" rules={emailRules}>
              <Input placeholder="Enter email" size="large" />
            </Form.Item>
          )}

          {isUpdate && (
            <Form.Item
              label="Current password"
              name="currentPassword"
              rules={passwordRules}
            >
              <Input.Password placeholder="Current password" size="large" />
            </Form.Item>
          )}

          <Form.Item
            label={isUpdate ? 'New password' : 'Password'}
            name={isUpdate ? 'newPassword' : 'password'}
            rules={passwordRules}
          >
            <Input.Password
              placeholder={isUpdate ? 'New password' : 'Enter password'}
              size="large"
            />
          </Form.Item>

          {isUpdate && (
            <Form.Item
              label="Confirm new password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Passwords do not match'),
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" size="large" />
            </Form.Item>
          )}

          <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              className="auth-submit"
            >
              {buttonText}
            </Button>
          </Form.Item>

          <div className="auth-links">
            {isSignIn && (
              <>
                <Text>
                  Don&apos;t have an account?{' '}
                  <a onClick={() => navigate('/signup')}>Sign up</a>
                </Text>
                <a onClick={() => navigate('/update-password')}>
                  Forgot password?
                </a>
              </>
            )}
            {isSignUp && (
              <Text style={{ textAlign: 'center', width: '100%' }}>
                Already have an account?{' '}
                <a onClick={() => navigate('/signin')}>Sign in</a>
              </Text>
            )}
            {isUpdate && (
              <Text style={{ textAlign: 'center', width: '100%' }}>
                Back to{' '}
                <a onClick={() => navigate('/signin')}>Sign in</a>
              </Text>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AuthForm;
