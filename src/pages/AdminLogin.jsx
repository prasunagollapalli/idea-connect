import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Check if the provided username matches the one in the database
      const { data: configData, error: configError } = await supabase
        .from('admin_config')
        .select('username')
        .eq('id', 1)
        .single();

      if (configError || !configData) {
        throw new Error('Could not fetch admin configuration.');
      }

      if (username !== configData.username) {
        throw new Error('Invalid Admin Username.');
      }

      // 2. If username matches, log in using the hidden Supabase admin email
      const hiddenAdminEmail = 'admin@ideaconnect.system';
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: hiddenAdminEmail, 
        password 
      });
      
      if (authError) throw authError;

      const userRole = data.user?.user_metadata?.role;

      if (userRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access Denied: You do not have administrator privileges.');
      }

      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in" style={{ maxWidth: '420px' }}>
        <div className="auth-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{
              padding: '20px',
              background: 'rgba(244, 63, 94, 0.12)',
              borderRadius: '50%',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              boxShadow: '0 0 30px rgba(244, 63, 94, 0.2)'
            }}>
              <Lock size={36} color="#f43f5e" />
            </div>
          </div>
          <h1 style={{ background: 'linear-gradient(135deg, #f43f5e, #ff8a65)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '1.8rem', fontWeight: 800 }}>
            Admin Portal
          </h1>
          <p className="text-muted" style={{ marginTop: '8px' }}>Secure access for platform administrators only.</p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input type="text" className="input-glass" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input type="password" className="input-glass" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #f43f5e, #ff8a65)', marginTop: '8px' }}>
            {loading ? 'Authenticating...' : 'Access Portal'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Not an admin? <a href="/auth" style={{ color: 'var(--primary)' }}>Return to login</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
