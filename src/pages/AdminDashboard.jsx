import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ visits: 0, ideas: 0, announcements: 0, users: 0, roles: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({ title: '', content: '', type: 'update' });
  const [settingsForm, setSettingsForm] = useState({ username: '', newPassword: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [legalDoc, setLegalDoc] = useState('privacy');
  const [legalForm, setLegalForm] = useState({ privacy_title: 'Privacy Policy', privacy_content: '', terms_title: 'Terms & Conditions', terms_content: '' });
  const [legalLoading, setLegalLoading] = useState(false);

  // Guard: redirect if not admin
  useEffect(() => {
    if (user && user.user_metadata?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAnnouncements(),
      fetchIdeas(),
      fetchUsers(),
      fetchStats(),
      fetchSettings(),
      fetchLegal()
    ]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('admin_config').select('username').eq('id', 1).single();
    if (data) setSettingsForm(prev => ({ ...prev, username: data.username }));
  };

  const fetchLegal = async () => {
    const { data } = await supabase.from('legal_documents').select('*');
    if (data) {
      const privacy = data.find(d => d.slug === 'privacy');
      const terms = data.find(d => d.slug === 'terms');
      setLegalForm({
        privacy_title: privacy?.title || 'Privacy Policy',
        privacy_content: privacy?.content || '',
        terms_title: terms?.title || 'Terms & Conditions',
        terms_content: terms?.content || '',
      });
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch visits
      const { data: metricsData } = await supabase.from('site_metrics').select('visits').single();
      const visits = metricsData?.visits || 0;

      // Fetch counts
      const { count: ideasCount } = await supabase.from('ideas').select('*', { count: 'exact', head: true });
      const { count: annCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // Fetch user roles breakdown
      const { data: profilesData } = await supabase.from('profiles').select('role');
      const rolesCount = {};
      if (profilesData) {
        profilesData.forEach(p => {
          const r = p.role || 'normal';
          rolesCount[r] = (rolesCount[r] || 0) + 1;
        });
      }

      setStats({
        visits,
        ideas: ideasCount || 0,
        announcements: annCount || 0,
        users: usersCount || 0,
        roles: rolesCount
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error) setUsers(data);
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (!error) setAnnouncements(data);
  };

  const fetchIdeas = async () => {
    const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
    if (!error) setIdeas(data);
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update({ title: form.title, content: form.content, type: form.type })
          .eq('id', editingId);
        if (error) throw error;
        showMsg('success', 'Announcement updated!');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([{ title: form.title, content: form.content, type: form.type }]);
        if (error) throw error;
        showMsg('success', 'Announcement published!');
      }

      setForm({ title: '', content: '', type: 'update' });
      setShowForm(false);
      setEditingId(null);
      fetchAnnouncements();
      fetchStats();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ann) => {
    setForm({ title: ann.title, content: ann.content, type: ann.type });
    setEditingId(ann.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) {
      setAnnouncements(announcements.filter(a => a.id !== id));
      showMsg('success', 'Deleted successfully');
      fetchStats();
    }
  };

  const handleDeleteIdea = async (id) => {
    if (!window.confirm('Delete this idea permanently?')) return;
    const { error } = await supabase.from('ideas').delete().eq('id', id);
    if (!error) {
      setIdeas(ideas.filter(i => i.id !== id));
      showMsg('success', 'Idea deleted');
      fetchStats();
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user profile? (Note: They will still have a login session unless you use Supabase dashboard, but their profile and posts will be restricted/deleted)')) return;
    
    // First, let's delete their posts if we want to cleanup
    await supabase.from('ideas').delete().eq('author_id', id);
    
    // Then delete profile
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    
    if (error) {
      showMsg('error', error.message);
    } else {
      setUsers(users.filter(u => u.id !== id));
      showMsg('success', 'User profile removed');
      fetchData(); // Refresh everything
    }
  };

  const handleCancel = () => {
    setForm({ title: '', content: '', type: 'update' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      // 1. Update Username in admin_config
      if (settingsForm.username) {
        const { error: configError } = await supabase
          .from('admin_config')
          .update({ username: settingsForm.username })
          .eq('id', 1);
        if (configError) throw configError;
      }

      // 2. Update Password in Supabase Auth
      if (settingsForm.newPassword) {
        const { error: authError } = await supabase.auth.updateUser({
          password: settingsForm.newPassword
        });
        if (authError) throw authError;
      }

      showMsg('success', 'Admin credentials updated successfully!');
      setSettingsForm(prev => ({ ...prev, newPassword: '' })); // clear password field
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveLegal = async (e) => {
    e.preventDefault();
    setLegalLoading(true);
    try {
      const slug = legalDoc;
      const title = legalDoc === 'privacy' ? legalForm.privacy_title : legalForm.terms_title;
      const content = legalDoc === 'privacy' ? legalForm.privacy_content : legalForm.terms_content;

      const { error } = await supabase
        .from('legal_documents')
        .upsert({ slug, title, content, updated_at: new Date().toISOString() }, { onConflict: 'slug' });

      if (error) throw error;
      showMsg('success', `${title} saved successfully!`);
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setLegalLoading(false);
    }
  };

  const typeColors = {
    update: 'var(--primary)',
    event: 'var(--secondary)',
    alert: 'var(--accent)',
  };

  return (
    <div className="admin-container container">
      {/* Header */}
      <div className="admin-header glass-panel">
        <div>
          <h1 className="text-gradient">Admin Dashboard</h1>
          <p className="text-muted">Platform management for IdeaConnect</p>
        </div>
        <button className="btn-outline" onClick={() => { supabase.auth.signOut(); navigate('/'); }}>
          Sign Out
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`admin-msg ${message.type}`}>{message.text}</div>
      )}

      {/* Tabs */}
      <div className="admin-tabs" style={{ flexWrap: 'wrap' }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 Users ({users.length})
        </button>
        <button className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`} onClick={() => setActiveTab('ideas')}>
          💡 Ideas ({ideas.length})
        </button>
        <button className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
          📢 Announcements ({announcements.length})
        </button>
        <button className={`tab-btn ${activeTab === 'legal' ? 'active' : ''}`} onClick={() => setActiveTab('legal')}>
          📄 Legal Pages
        </button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          ⚙️ Settings
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="admin-section animate-fade-in">
          <div className="section-toolbar">
            <h2>Platform Statistics</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '3px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Total Visits</h3>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '12px' }}>{stats.visits}</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '3px solid #10b981' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Total Users</h3>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '12px' }}>{stats.users}</p>
            </div>

            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '3px solid #f59e0b' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Total Ideas</h3>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '12px' }}>{stats.ideas}</p>
            </div>

            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '3px solid var(--secondary)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Announcements</h3>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '12px' }}>{stats.announcements}</p>
            </div>
          </div>

          <h3 style={{ marginTop: '24px' }}>Users by Role</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(stats.roles).map(([role, count]) => (
              <div key={role} className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{role}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="admin-section animate-fade-in">
          <div className="section-toolbar">
            <h2>Registered Users</h2>
          </div>
          <div className="ideas-admin-list">
            {users.length === 0 ? (
              <div className="empty-state glass-panel"><p>No users found.</p></div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="idea-admin-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {u.full_name || 'No Name'} 
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 600 }}>{u.role}</span>
                    </h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                      Phone: {u.phone_number || 'N/A'} {u.company_name ? `· Company: ${u.company_name}` : ''}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '8px' }}>Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                  {u.role !== 'admin' && (
                    <button className="action-btn delete-btn" onClick={() => handleDeleteUser(u.id)}>🗑️ Remove</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── IDEAS TAB ── */}
      {activeTab === 'ideas' && (
        <div className="admin-section animate-fade-in">
          <div className="section-toolbar">
            <h2>All Posted Ideas</h2>
          </div>
          <div className="ideas-admin-list">
            {ideas.length === 0 ? (
              <div className="empty-state glass-panel"><p>No ideas posted yet.</p></div>
            ) : (
              ideas.map((idea) => (
                <div key={idea.id} className="idea-admin-card glass-panel">
                  <div className="idea-admin-meta">
                    <div>
                      <h3>{idea.title}</h3>
                      <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        by <strong>{idea.author_name}</strong> · {idea.category} · ❤️ {idea.likes || 0}
                      </p>
                    </div>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteIdea(idea.id)}>🗑️ Delete</button>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px', lineHeight: 1.5 }}>
                    {idea.description?.slice(0, 200)}{idea.description?.length > 200 ? '...' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── ANNOUNCEMENTS TAB ── */}
      {activeTab === 'announcements' && (
        <div className="admin-section animate-fade-in">
          <div className="section-toolbar">
            <h2>Announcements</h2>
            {!showForm && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                + New Announcement
              </button>
            )}
          </div>

          {/* Create / Edit Form */}
          {showForm && (
            <form className="ann-form glass-panel animate-fade-in" onSubmit={handleSave}>
              <h3>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Announcement title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  className="input-glass textarea-glass"
                  rows="3"
                  placeholder="Write your announcement..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select className="input-glass select-glass" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="update">Update</option>
                  <option value="event">Event</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Publish'}
                </button>
                <button type="button" className="btn-outline" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          )}

          {/* Announcements List */}
          <div className="ann-list">
            {announcements.length === 0 ? (
              <div className="empty-state glass-panel">
                <p>No announcements yet. Create one above!</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="ann-card glass-panel">
                  <div className="ann-top">
                    <span className="ann-type-badge" style={{ background: `${typeColors[ann.type] || 'var(--primary)'}20`, color: typeColors[ann.type] || 'var(--primary)', border: `1px solid ${typeColors[ann.type] || 'var(--primary)'}40` }}>
                      {ann.type?.toUpperCase()}
                    </span>
                    <span className="ann-date">{new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="ann-title">{ann.title}</h3>
                  <p className="ann-content text-muted">{ann.content}</p>
                  <div className="ann-actions">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(ann)}>✏️ Edit</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(ann.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── LEGAL PAGES TAB ── */}
      {activeTab === 'legal' && (
        <div className="admin-section animate-fade-in">
          <div className="section-toolbar">
            <h2>Legal Pages</h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              className={`tab-btn ${legalDoc === 'privacy' ? 'active' : ''}`}
              onClick={() => setLegalDoc('privacy')}
            >Privacy Policy</button>
            <button
              className={`tab-btn ${legalDoc === 'terms' ? 'active' : ''}`}
              onClick={() => setLegalDoc('terms')}
            >Terms &amp; Conditions</button>
          </div>

          <form className="ann-form glass-panel" onSubmit={handleSaveLegal}>
            <div className="form-group">
              <label>Page Title</label>
              <input
                type="text"
                className="input-glass"
                value={legalDoc === 'privacy' ? legalForm.privacy_title : legalForm.terms_title}
                onChange={(e) => setLegalForm(prev => legalDoc === 'privacy'
                  ? { ...prev, privacy_title: e.target.value }
                  : { ...prev, terms_title: e.target.value }
                )}
                required
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>Write or paste the full content here. Line breaks and spacing will be preserved.</p>
              <textarea
                className="input-glass textarea-glass"
                rows="16"
                placeholder="Write your legal document content here..."
                value={legalDoc === 'privacy' ? legalForm.privacy_content : legalForm.terms_content}
                onChange={(e) => setLegalForm(prev => legalDoc === 'privacy'
                  ? { ...prev, privacy_content: e.target.value }
                  : { ...prev, terms_content: e.target.value }
                )}
                style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={legalLoading}>
                {legalLoading ? 'Saving...' : 'Save Document'}
              </button>
              <a href={`/legal/${legalDoc}`} target="_blank" rel="noreferrer" className="btn-outline">Preview Page ↗</a>
            </div>
          </form>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === 'settings' && (
        <div className="admin-section animate-fade-in">
          <div className="section-toolbar">
            <h2>Admin Credentials Settings</h2>
          </div>
          
          <form className="ann-form glass-panel" onSubmit={handleUpdateSettings} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p className="text-muted" style={{ marginBottom: '16px' }}>
              Update your custom admin username and password here. The username is what you type on the login screen.
            </p>

            <div className="form-group">
              <label>Admin Username</label>
              <input
                type="text"
                className="input-glass"
                placeholder="admin"
                value={settingsForm.username}
                onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password (Optional)</label>
              <input
                type="password"
                className="input-glass"
                placeholder="Leave blank to keep current password"
                value={settingsForm.newPassword}
                onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={settingsLoading} style={{ marginTop: '16px' }}>
              {settingsLoading ? 'Saving...' : 'Save Credentials'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
