import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import AuthForm from '../../components/AuthForm.jsx';
import { signUp, clearAuthError } from '../../features/auth/authSlice.js';
import { fetchCart } from '../../features/cart/cartSlice.js';

/**
 * /signup — reuses AuthForm with mode="signup".
 */
const SignUp = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error } = useSelector((s) => s.auth);

    const handleSubmit = async (values) => {
        dispatch(clearAuthError());
        const res = await dispatch(signUp(values));
        if (res.meta.requestStatus === 'fulfilled') {
            message.success('Account created!');
            dispatch(fetchCart());
            navigate('/');
        }
    };

    return (
        <AuthForm
            mode="signup"
            onFinish={handleSubmit}
            loading={status === 'loading'}
            errorText={error}
        />
    );
};

export default SignUp;