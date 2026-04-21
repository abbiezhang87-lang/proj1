import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './app/store.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#5e5adb',
            borderRadius: 6,
            fontFamily:
              "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
        }}
      >
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
