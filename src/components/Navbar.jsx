import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, Users, LogOut, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import RoleBadge from './RoleBadge';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { path: '/feed', label: 'Ideas Feed', icon: <Lightbulb size={20} /> },
    { path: '#', label: 'Network', icon: <Users size={20} /> },
  ];

  const userRole = user?.user_metadata?.role || 'normal';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text text-gradient">IdeaConnect</span>
        </Link>

        <nav className="navbar-links">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              {userRole !== 'admin' && (
                <Link to="/post" className="btn-primary post-btn">
                  <Plus size={20} />
                  <span>Post Idea</span>
                </Link>
              )}
              {userRole === 'admin' && (
                <Link to="/admin-dashboard" className="btn-primary post-btn" style={{ background: 'linear-gradient(135deg, #f43f5e, #ff8a65)' }}>
                  <span>⚙️ Admin Panel</span>
                </Link>
              )}
              <div className="user-profile-menu">
                <div className="user-info-brief">
                  <span className="user-name-text">{userName}</span>
                  <RoleBadge role={userRole} />
                </div>
                <Link to="/profile" className="profile-link" title="My Profile">
                  <UserIcon size={20} />
                </Link>
                <button onClick={handleLogout} className="logout-btn" title="Log Out">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-outline">
                Log In
              </Link>
              <Link to="/auth" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
