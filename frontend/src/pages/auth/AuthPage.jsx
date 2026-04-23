import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signIn,
  signUp,
  requestPasswordReset,
  confirmPasswordReset,
  clearAuthError,
} from '../../features/auth/authSlice.js';
import { fetchCart } from '../../features/cart/cartSlice.js';
import { EMAIL_RE, MIN_PASSWORD, MIN_NAME } from '../../utils/validators.js';

/**
 * 三合一认证页：
 *   /auth?mode=signin | signup | update-password
 *   /reset-password?token=xxx   ← 邮件链接点进来走确认屏
 */

function validate(mode, v) {
  const e = {};
  if (mode === 'signup' && (!v.name || v.name.trim().length < MIN_NAME))
    e.name = `Name must be at least ${MIN_NAME} characters`;
  if (mode === 'signin' || mode === 'signup') {
    if (!EMAIL_RE.test(v.email || '')) e.email = 'Enter a valid email address';
    if (!v.password || v.password.length < MIN_PASSWORD)
      e.password = `Password must be at least ${MIN_PASSWORD} characters`;
  }
  // update-password 新流程：只验邮箱，真正的新密码在邮件落地页填
  if (mode === 'update-password') {
    if (!EMAIL_RE.test(v.email || '')) e.email = 'Enter a valid email address';
  }
  return e;
}

// /reset-password 邮件落地页专用：校验新密码 + 确认密码
function validateResetForm(v) {
  const e = {};
  if (!v.newPassword || v.newPassword.length < MIN_PASSWORD)
    e.newPassword = `New password must be at least ${MIN_PASSWORD} characters`;
  if (v.confirmPassword !== v.newPassword)
    e.confirmPassword = 'Passwords do not match';
  return e;
}

// 带 label 的 input
function Field({ label, error, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input
        {...rest}
        className={
          'block w-full rounded-md border bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 ' +
          (error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-300 hover:border-gray-400 focus:border-brand-500 focus:ring-brand-500/30')
        }
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

// 文字型链接按钮，底部帮助文字里 5 处都用它
function LinkBtn({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-medium text-brand-600 hover:text-brand-700"
    >
      {children}
    </button>
  );
}

// 渐变背景 + 白卡 + 版权，登录卡和状态屏共用
function Shell({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-8">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          © 2026 Management Chuwa. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// 圆形图标 + 标题 + 说明 + 按钮，"邮件已发送 / 重置成功 / 重置失败"三屏共用
const TONES = {
  brand: 'bg-brand-50 text-brand-500',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
};
function Status({ icon, tone = 'brand', title, text, btn, onBtn }) {
  return (
    <div className="text-center">
      <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-3xl ${TONES[tone]}`}>
        {icon}
      </div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mb-6 text-sm text-gray-600">{text}</p>
      {btn && (
        <button
          type="button"
          onClick={onBtn}
          className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
        >
          {btn}
        </button>
      )}
    </div>
  );
}

// 邮件落地页：用户从邮件点进来，在这里填"新密码 + 确认密码"再提交
// 三种 phase：
//   form     —— 默认状态，展示表单
//   success  —— 改密成功（已自动登录）
//   error    —— token 缺失 / 过期 / 后端报错
function ResetConfirm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const token = sp.get('token');
  const { status, error } = useSelector((s) => s.auth);
  const loading = status === 'loading';

  const [phase, setPhase] = useState(token ? 'form' : 'error');
  const [msg] = useState(token ? '' : 'Missing token in the URL.');
  const [values, setValues] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (submitted)
      setErrors((p) => {
        const n = { ...p };
        delete n[k];
        return n;
      });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateResetForm(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const res = await dispatch(
      confirmPasswordReset({ token, newPassword: values.newPassword }),
    );
    if (res.meta.requestStatus !== 'fulfilled') return;
    dispatch(fetchCart());
    setPhase('success');
    /*setTimeout(() => navigate('/'), 2000);*/ /*不自动跳，给用户看成功提示，不会直接跳到主页*/
  };

  if (phase === 'success')
    return (
      <Status
        icon="✓"
        tone="green"
        title="Password updated"
        text="You're signed in. You can continue browsing or head back to the home page."
        btn="Go to home"
        onBtn={() => navigate('/')}
      />
    );

  if (phase === 'error')
    return (
      <Status
        icon="!"
        tone="red"
        title="Link invalid or expired"
        text={msg}
        btn="Request a new link"
        onBtn={() => navigate('/auth?mode=update-password')}
      />
    );

  // phase === 'form'
  return (
    <>
      <h1 className="mb-1 text-xl font-semibold text-gray-900 sm:text-2xl">
        Update your password
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Pick a strong new password you haven&apos;t used before.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field
          label="New password"
          type="password"
          placeholder={`At least ${MIN_PASSWORD} characters`}
          autoComplete="new-password"
          value={values.newPassword}
          onChange={setField('newPassword')}
          error={errors.newPassword}
        />
        <Field
          label="Confirm new password"
          type="password"
          placeholder="Re-enter new password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={setField('confirmPassword')}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className={
            'mt-2 w-full rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm ' +
            (loading ? 'bg-brand-500/60 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600')
          }
        >
          {loading ? 'Please wait…' : 'Update Password'}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-gray-500">
        <LinkBtn onClick={() => navigate('/')}>Back to home</LinkBtn>
      </div>
    </>
  );
}

const COPY = {
  signin: { title: 'Sign in to your account', sub: 'Welcome back — please enter your details.', btn: 'Sign In' },
  signup: { title: 'Create an account', sub: "Let's get you started in under a minute.", btn: 'Sign Up' },
  'update-password': { title: 'Update your password', sub: 'Enter your email, we will send you the recovery link.', btn: 'Update password' },
};
const MODES = Object.keys(COPY);

export default function AuthPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [sp] = useSearchParams();
  const { isLoggedIn } = useSelector((s) => s.auth);

  const rawMode = sp.get('mode');

  // 切 mode 时清错误 —— 必须写在 early return 之前，Hook 顺序要稳
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, rawMode]);

  if (location.pathname === '/reset-password')
    return <Shell><ResetConfirm /></Shell>;

  let mode = MODES.includes(rawMode) ? rawMode : 'signin';
  if (mode === 'update-password' && !isLoggedIn) mode = 'signin';

  // key={mode} 切 tab 自动 remount，表单 state 自然重置
  return (
    <Shell>
      <AuthForm key={mode} mode={mode} isLoggedIn={isLoggedIn} />
    </Shell>
  );
}

function AuthForm({ mode, isLoggedIn }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [, setSp] = useSearchParams();
  const { status, error, user } = useSelector((s) => s.auth);
  const loading = status === 'loading';

  // update-password 模式下预填当前登录用户的邮箱（减少用户输入）
  const [values, setValues] = useState(() =>
    mode === 'update-password' && user?.email ? { email: user.email } : {},
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (submitted)
      setErrors((p) => {
        const n = { ...p };
        delete n[k];
        return n;
      });
  };
  const switchMode = (next) => setSp({ mode: next }, { replace: true });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(mode, values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    let res;
    if (mode === 'signin') {
      res = await dispatch(signIn({ email: values.email, password: values.password }));
    } else if (mode === 'signup') {
      res = await dispatch(signUp({ name: values.name, email: values.email, password: values.password }));
    } else {
      // 只发邮件；新密码等用户点邮件链接后在落地页上填
      res = await dispatch(requestPasswordReset({ email: values.email }));
    }

    if (res.meta.requestStatus !== 'fulfilled') return;
    if (mode === 'update-password') setSent(true);
    else {
      dispatch(fetchCart());
      navigate('/');
    }
  };

  if (sent && mode === 'update-password') {
    return (
      <Status
        icon="✉"
        title="Check your email"
        text={`We have sent the update password link to your email${values.email ? ` (${values.email})` : ''}, please check that!`}
        btn="Back to home"
        onBtn={() => navigate('/')}
      />
    );
  }

  const { title, sub, btn } = COPY[mode];

  return (
    <>
      {mode !== 'update-password' && (
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={
                'rounded-md px-3 py-2 text-sm font-medium ' +
                (mode === m ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900')
              }
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
      )}

      <h1 className="mb-1 text-xl font-semibold text-gray-900 sm:text-2xl">{title}</h1>
      <p className="mb-6 text-sm text-gray-500">{sub}</p>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === 'signup' && (
          <Field
            label="Name"
            type="text"
            placeholder="Enter your name"
            autoComplete="name"
            value={values.name || ''}
            onChange={setField('name')}
            error={errors.name}
          />
        )}
        {(mode === 'signin' || mode === 'signup') && (
          <>
            <Field
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={values.email || ''}
              onChange={setField('email')}
              error={errors.email}
            />
            <Field
              label="Password"
              type="password"
              placeholder={`At least ${MIN_PASSWORD} characters`}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={values.password || ''}
              onChange={setField('password')}
              error={errors.password}
            />
          </>
        )}
        {mode === 'update-password' && (
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email || ''}
            onChange={setField('email')}
            error={errors.email}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className={
            'mt-2 w-full rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm ' +
            (loading ? 'bg-brand-500/60 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600')
          }
        >
          {loading ? 'Please wait…' : btn}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-gray-500">
        {mode === 'signin' && (
          <>
            No account? <LinkBtn onClick={() => switchMode('signup')}>Sign up</LinkBtn>
            {isLoggedIn && (
              <> · <LinkBtn onClick={() => switchMode('update-password')}>Update password</LinkBtn></>
            )}
          </>
        )}
        {mode === 'signup' && (
          <>Already have an account? <LinkBtn onClick={() => switchMode('signin')}>Sign in</LinkBtn></>
        )}
        {mode === 'update-password' && (
          <LinkBtn onClick={() => navigate('/')}>Back to home</LinkBtn>
        )}
      </div>
    </>
  );
}
