import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  const handleCopyrightClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      navigate('/admin');
    }
  };

  return (
    <footer className="footer-container glass-panel">
      <div className="footer-content container">
        <div className="footer-brand">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">✨</span>
            <span className="logo-text text-gradient">IdeaConnect</span>
          </Link>
          <p className="footer-desc">
            The bridge between visionaries and builders. Connecting students, founders, and investors to scale ambition into reality.
          </p>
          <div className="social-links">
            <a href="https://www.instagram.com/kiran._mr.8/" target="_blank" rel="noreferrer" className="social-icon" title="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://www.linkedin.com/in/kiransai-pasupuleti-106b24323/" target="_blank" rel="noreferrer" className="social-icon" title="LinkedIn">
              <LinkedInIcon />
            </a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-group">
            <h4>Platform</h4>
            <Link to="/feed">Ideas Feed</Link>
            <Link to="/post">Post Idea</Link>
            <Link to="/auth">Network</Link>
          </div>
          <div className="footer-group">
            <h4>Legal</h4>
            <Link to="/legal/privacy">Privacy Policy</Link>
            <Link to="/legal/terms">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p
            onClick={handleCopyrightClick}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            &copy; {currentYear} IdeaConnect. All rights reserved.
          </p>
          <p className="footer-tagline">Made with ✨ for the next generation of founders.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
