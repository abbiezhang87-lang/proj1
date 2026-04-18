import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing/index.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/test')
      .then((res) => res.json())
      .then((data) => {
        console.log('Data from backend:', data);
      });
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        {/* 必须使用 Route 标签，并把组件放在 element 属性里 */}
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>


  );
}

export default App;

