import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, User, Trash2, Edit3, User as RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone_number || '');
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUserPosts(data);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          phone_number: phone 
        }
      });

      if (error) throw error;
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setUserPosts(userPosts.filter(p => p.id !== postId));
      alert('Post deleted successfully');
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost({ ...post });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('ideas')
        .update({
          title: editingPost.title,
          description: editingPost.description,
          category: editingPost.category,
          funding_required: editingPost.funding_required
        })
        .eq('id', editingPost.id)
        .select();

      if (error) throw error;
      
      // If data is empty, it means the database blocked the update (usually due to Row Level Security)
      if (!data || data.length === 0) {
        throw new Error("Database blocked the update! You need to add an UPDATE policy for the 'ideas' table in Supabase.");
      }

      setUserPosts(userPosts.map(p => p.id === editingPost.id ? editingPost : p));
      setEditingPost(null);
      // Navigate to feed and force a clean entry so location changes correctly
      navigate('/feed', { replace: true });
    } catch (err) {
      alert('Error updating post: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="container" style={{padding: '100px', textAlign: 'center'}}>Please log in to view your profile.</div>;

  return (
    <div className="container profile-container">
      <div className="profile-grid">
        
        {/* Left: Profile Edit */}
        <div className="auth-card glass-panel" style={{ height: 'fit-content' }}>
          <div className="auth-header">
            <h2 className="text-gradient">Edit Profile</h2>
            <p className="text-muted">Update your personal details</p>
          </div>

          {message && (
            <div className={message.type === 'success' ? 'success-message' : 'error-message'} style={{ marginBottom: '16px' }}>
              {message.text}
            </div>
          )}

          <form className="auth-form" onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-glass" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input 
                  type="tel" 
                  className="input-glass" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Right: Posts Management */}
        <div className="posts-management">
          <h2 className="text-gradient" style={{ marginBottom: '24px' }}>My Posted Ideas</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {userPosts.length === 0 ? (
              <p className="text-muted">You haven't posted any ideas yet.</p>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>{post.title}</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>{post.category}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="action-btn" onClick={() => handleEditPost(post)} title="Edit">
                      <Edit3 size={18} />
                    </button>
                    <button className="action-btn" onClick={() => handleDeletePost(post.id)} title="Delete" style={{ color: 'var(--accent)' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal (Simplified) */}
      {editingPost && (
        <div className="modal-overlay glass-panel">
          <h2 className="text-gradient" style={{ marginBottom: '24px' }}>Edit Idea</h2>
          <form className="auth-form" onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                className="input-glass" 
                value={editingPost.title}
                onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                className="input-glass textarea-glass" 
                rows="4"
                value={editingPost.description}
                onChange={(e) => setEditingPost({...editingPost, description: e.target.value})}
              ></textarea>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn-primary" disabled={loading}>Save Changes</button>
              <button type="button" className="btn-outline" onClick={() => setEditingPost(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
