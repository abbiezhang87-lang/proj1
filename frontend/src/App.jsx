import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AuthPage from './pages/auth/AuthPage.jsx';
import ProductList from './pages/product/ProductList.jsx';
import ProductDetail from './pages/product/ProductDetail.jsx';
import CreateProduct from './pages/product/CreateProduct.jsx';
import EditProduct from './pages/product/EditProduct.jsx';
import OrderHistory from './pages/order/OrderHistory.jsx';
import ErrorPage from './pages/error/ErrorPage.jsx';

import { fetchMe } from './features/auth/authSlice.js';
import { fetchCart } from './features/cart/cartSlice.js';

import './App.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchMe());
      dispatch(fetchCart());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* 统一认证页：signin / signup / update-password 共用 */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Magic link 入口：用户从邮件点击链接跳过来，AuthPage 内部会自动确认 */}
          <Route path="/reset-password" element={<AuthPage />} />

          {/* 旧路径兼容 —— 有人在外面贴了 /signin 链接也不会 404 */}
          <Route
            path="/signin"
            element={<Navigate to="/auth?mode=signin" replace />}
          />
          <Route
            path="/signup"
            element={<Navigate to="/auth?mode=signup" replace />}
          />
          <Route
            path="/update-password"
            element={
              <ProtectedRoute>
                <Navigate to="/auth?mode=update-password" replace />
              </ProtectedRoute>
            }
          />

          {/* 额外功能：Order History（仅登录用户可看） */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/products/new"
            element={
              <ProtectedRoute adminOnly>
                <CreateProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute adminOnly>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
