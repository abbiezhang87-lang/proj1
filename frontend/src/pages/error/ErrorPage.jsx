import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * Figma "Oops, something went wrong!" 页面
 * 给 ErrorBoundary 和 404 兜底用
 */
const ErrorPage = ({ onGoHome }) => {
  const navigate = useNavigate();
  const handle = () => (onGoHome ? onGoHome() : navigate('/'));

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl rounded-lg bg-white px-6 py-16 text-center shadow">
        <ExclamationCircleOutlined style={{ fontSize: 64, color: '#5e5adb' }} />
        <h2 className="my-6 text-xl font-semibold">Oops, something went wrong!</h2>
        <Button
          type="primary"
          size="large"
          onClick={handle}
          style={{ background: '#5e5adb', borderColor: '#5e5adb', minWidth: 140 }}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
