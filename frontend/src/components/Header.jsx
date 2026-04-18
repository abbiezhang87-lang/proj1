import { Input, Badge, Dropdown, Avatar, Button } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.js';
import { resetCart, openDrawer, selectCartCount } from '../features/cart/cartSlice.js';
import { setQuery } from '../features/product/productSlice.js';
import { formatPrice } from '../utils/validators.js';
import './Header.css';

/**
 * Site header — matches the Figma: brand "Management Chuwa", search bar,
 * user menu, cart with badge + subtotal. Responsive (mobile collapses).
 */
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const cartSubtotal = useSelector((s) => s.cart.subtotal);

  const handleSearch = (e) => {
    const val = e.target.value;
    dispatch(setQuery(val));
    if (window.location.pathname !== '/') navigate('/');
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate('/signin');
  };

  const menuItems = isLoggedIn
    ? [
        { key: 'name', label: user?.name || 'Account', disabled: true },
        { type: 'divider' },
        {
          key: 'update-password',
          label: 'Update password',
          onClick: () => navigate('/update-password'),
        },
        { key: 'logout', label: 'Sign Out', onClick: onLogout },
      ]
    : [
        { key: 'signin', label: 'Sign In', onClick: () => navigate('/signin') },
        { key: 'signup', label: 'Sign Up', onClick: () => navigate('/signup') },
      ];

  const openCart = () => {
    if (!isLoggedIn) {
      // guest cart is still usable — just open the drawer
      dispatch(openDrawer());
      return;
    }
    dispatch(openDrawer());
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand" onClick={() => navigate('/')}>
          <span className="brand-big">Management</span>
          <span className="brand-sub">Chuwa</span>
        </div>

        <Input
          className="search"
          size="large"
          placeholder="Search"
          prefix={<SearchOutlined />}
          onChange={handleSearch}
          allowClear
        />

        <div className="header-right">
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button type="text" className="icon-btn">
              <Avatar size={28} icon={<UserOutlined />} />
              <span className="hide-sm">
                {isLoggedIn ? 'Sign Out' : 'Sign In'}
              </span>
            </Button>
          </Dropdown>

          <Button type="text" className="icon-btn" onClick={openCart}>
            <Badge count={cartCount} size="small" offset={[0, 2]}>
              <ShoppingCartOutlined style={{ fontSize: 22 }} />
            </Badge>
            <span className="hide-sm">{formatPrice(cartSubtotal)}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
