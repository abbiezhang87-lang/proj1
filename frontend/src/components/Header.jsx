import { useState } from 'react';
import { Dropdown, Badge } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.js';
import {
  resetCart,
  openDrawer,
  selectCartCount,
} from '../features/cart/cartSlice.js';
import { setQuery } from '../features/product/productSlice.js';
import { formatPrice } from '../utils/validators.js';


const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const cartSubtotal = useSelector((s) => s.cart.subtotal);


  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e) => {
    dispatch(setQuery(e.target.value));
    if (window.location.pathname !== '/') navigate('/');
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate('/auth?mode=signin');
  };

  const menuItems = isLoggedIn
    ? [
        { key: 'name', label: user?.name || 'Account', disabled: true },
        { type: 'divider' },
        {
          key: 'update-password',
          label: 'Update password',
          onClick: () => navigate('/auth?mode=update-password'),
        },
        { key: 'logout', label: 'Sign Out', onClick: onLogout },
      ]
    : [
        {
          key: 'signin',
          label: 'Sign In',
          onClick: () => navigate('/auth?mode=signin'),
        },
        {
          key: 'signup',
          label: 'Sign Up',
          onClick: () => navigate('/auth?mode=signup'),
        },
      ];

  return (
    <header className="sticky top-0 z-40 bg-ink text-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
       
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex shrink-0 items-baseline gap-1 text-left"
        >
          <span className="hidden text-lg font-bold text-white sm:inline sm:text-xl">
            Management
          </span>
         
          <span className="text-lg font-bold text-white sm:hidden">M</span>
          <span className="text-xs font-medium text-gray-300 sm:text-sm">
            Chuwa
          </span>
        </button>

     
        <div className="hidden flex-1 md:block">
          <div className="relative mx-auto w-full max-w-lg">
            <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              onChange={handleSearch}
              className="block w-full rounded-md border border-transparent bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

      
        <div className="flex-1 md:hidden" />

        
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
         
          <button
            type="button"
            onClick={() => setShowMobileSearch((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-200 hover:bg-white/10 md:hidden"
            aria-label="Search"
          >
            <SearchOutlined />
          </button>

          
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm text-white hover:bg-white/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                <UserOutlined />
              </span>
              <span className="hidden sm:inline">
                {isLoggedIn ? user?.name || 'Account' : 'Sign In'}
              </span>
            </button>
          </Dropdown>

        
          <button
            type="button"
            onClick={() => dispatch(openDrawer())}
            className="inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm text-white hover:bg-white/10"
          >
            <Badge count={cartCount} size="small" offset={[0, 2]}>
              <ShoppingCartOutlined style={{ fontSize: 20, color: '#fff' }} />
            </Badge>
            <span className="hidden min-w-[88px] text-right tabular-nums sm:inline-block">
              {formatPrice(cartSubtotal)}
            </span>
          </button>
        </div>
      </div>

      
      {showMobileSearch ? (
        <div className="border-t border-white/10 bg-ink-700 px-4 py-2 md:hidden">
          <div className="relative">
            <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              onChange={handleSearch}
              autoFocus
              className="block w-full rounded-md border border-transparent bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
