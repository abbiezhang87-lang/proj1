import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';


const Layout = () => (
  <div className="app-shell">
    <Header />
    <main className="app-main">
      <Outlet />
    </main>
    <Footer />
    <CartDrawer />
  </div>
);

export default Layout;
