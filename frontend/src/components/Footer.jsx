import {
  YoutubeFilled,
  TwitterOutlined,
  FacebookFilled,
} from '@ant-design/icons';
import './Footer.css';

/**
 * Static footer — matches the Figma.
 */
const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <span className="copy">©2026 All Rights Reserved.</span>
      <div className="socials">
        <a href="#" aria-label="YouTube">
          <YoutubeFilled />
        </a>
        <a href="#" aria-label="Twitter">
          <TwitterOutlined />
        </a>
        <a href="#" aria-label="Facebook">
          <FacebookFilled />
        </a>
      </div>
      <nav className="footer-links">
        <a href="#">Contact us</a>
        <a href="#">Privacy Policies</a>
        <a href="#">Help</a>
      </nav>
    </div>
  </footer>
);

export default Footer;
