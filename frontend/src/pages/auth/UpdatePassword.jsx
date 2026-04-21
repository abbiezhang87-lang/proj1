import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import AuthForm from '../../components/AuthForm.jsx';
import {
    updatePassword,
    clearAuthError,
} from '../../features/auth/authSlice.js';

/**
 * /update-password — reuses AuthForm with mode="update-password".
 * Only logged-in users can reach this route (see App routing).
 */
const UpdatePassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error } = useSelector((s) => s.auth);

    const handleSubmit = async (values) => {
        dispatch(clearAuthError());
        const res = await dispatch(
            updatePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            }),
        );
        if (res.meta.requestStatus === 'fulfilled') {
            message.success('Password updated');
            navigate('/');
        }
    };

    return (
        <AuthForm
            mode="update-password"
            onFinish={handleSubmit}
            loading={status === 'loading'}
            errorText={error}
        />
    );
};

export default UpdatePassword;