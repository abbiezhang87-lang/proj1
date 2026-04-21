import {
  YoutubeFilled,
  TwitterOutlined,
  FacebookFilled,
} from '@ant-design/icons';


const Footer = () => (
  <footer className="bg-ink text-gray-300">
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-5 text-sm sm:flex-row sm:justify-between sm:px-6 lg:px-8">
      <span className="order-3 sm:order-1">
        © 2026 All Rights Reserved.
      </span>

      <div className="order-1 flex items-center gap-4 text-lg sm:order-2">
        <a href="#" aria-label="YouTube" className="hover:text-white">
          <YoutubeFilled />
        </a>
        <a href="#" aria-label="Twitter" className="hover:text-white">
          <TwitterOutlined />
        </a>
        <a href="#" aria-label="Facebook" className="hover:text-white">
          <FacebookFilled />
        </a>
      </div>

      <nav className="order-2 flex items-center gap-4 sm:order-3">
        <a href="#" className="hover:text-white">
          Contact us
        </a>
        <a href="#" className="hover:text-white">
          Privacy Policies
        </a>
        <a href="#" className="hover:text-white">
          Help
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;
