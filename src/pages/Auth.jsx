import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, TrendingUp, Mail, Lock, Home, User as RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('normal');
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phoneNumber: '',
  });

  const roles = [
    { id: 'normal', label: 'Normal', icon: <User size={20} />, desc: 'Join as a student or professional' },
    { id: 'startup', label: 'Startup', icon: <Briefcase size={20} />, desc: 'Post ideas & find talent' },
    { id: 'investor', label: 'Investor', icon: <TrendingUp size={20} />, desc: 'Discover & back ideas' }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (loginError) throw loginError;
        navigate('/feed');
      } else {
        const { error: signupError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: selectedRole,
              phone_number: formData.phoneNumber,
              company_name: formData.companyName || null,
            }
          }
        });
        if (signupError) throw signupError;
        alert('Signup successful! Please check your email for verification.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <h1 className="text-gradient">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-muted">
            {isLogin ? 'Log in to your account to continue.' : 'Join the network and start connecting.'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="auth-toggle">
          <button 
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button 
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {!isLogin && (
          <div className="role-selector">
            <p className="role-label">I am a:</p>
            <div className="role-cards">
              {roles.map(role => (
                <div 
                  key={role.id}
                  className={`role-card ${selectedRole === role.id ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="role-icon">{role.icon}</div>
                  <h3>{role.label}</h3>
                  <p>{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="fullName"
                  className="input-glass" 
                  placeholder="John Doe" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="tel" 
                  name="phoneNumber"
                  className="input-glass" 
                  placeholder="+1 234 567 890" 
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>
          )}

          {!isLogin && (selectedRole === 'startup' || selectedRole === 'investor') && (
            <div className="form-group">
              <label>{selectedRole === 'startup' ? 'Company Name' : 'Investment Firm (Optional)'}</label>
              <div className="input-wrapper">
                <Home size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="companyName"
                  className="input-glass" 
                  placeholder={selectedRole === 'startup' ? 'Acme Corp' : 'Sequoia Capital'} 
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required={selectedRole === 'startup'}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email"
                className="input-glass" 
                placeholder="you@example.com" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                name="password"
                className="input-glass" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={20} /> : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
