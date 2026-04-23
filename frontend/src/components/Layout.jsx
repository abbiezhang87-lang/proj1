import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';

/**
 * Shared chrome: header + page content + footer + cart drawer.
 */
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
