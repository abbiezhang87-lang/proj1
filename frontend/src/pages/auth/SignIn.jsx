import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import AuthForm from '../../components/AuthForm.jsx';
import { signIn, clearAuthError } from '../../features/auth/authSlice.js';
import { fetchCart } from '../../features/cart/cartSlice.js';

/**
 * /signin — reuses AuthForm with mode="signin".
 */
const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const handleSubmit = async (values) => {
    dispatch(clearAuthError());
    const res = await dispatch(signIn(values));
    if (res.meta.requestStatus === 'fulfilled') {
      message.success('Welcome back!');
      // Phase III #2h: pull the user's previous cart
      dispatch(fetchCart());
      navigate('/');
    }
  };

  return (
    <AuthForm
      mode="signin"
      onFinish={handleSubmit}
      loading={status === 'loading'}
      errorText={error}
    />
  );
};

export default SignIn;
