import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * Matches the Figma "Oops, something went wrong!" mockup.
 * Used by ErrorBoundary AND for 404s (App router fallthrough).
 */
const ErrorPage = ({ onGoHome }) => {
  const navigate = useNavigate ? useNavigate() : null;
  const handle = () => {
    if (onGoHome) return onGoHome();
    if (navigate) return navigate('/');
    window.location.assign('/');
  };

  return (
    <div
      style={{
        background: '#f9fafb',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '64px 24px',
          borderRadius: 8,
          textAlign: 'center',
          width: '100%',
          maxWidth: 720,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        <ExclamationCircleOutlined
          style={{ fontSize: 64, color: '#5e5adb' }}
        />
        <h2 style={{ marginTop: 24, marginBottom: 24 }}>
          Oops, something went wrong!
        </h2>
        <Button
          type="primary"
          size="large"
          onClick={handle}
          style={{
            background: '#5e5adb',
            borderColor: '#5e5adb',
            minWidth: 140,
          }}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
