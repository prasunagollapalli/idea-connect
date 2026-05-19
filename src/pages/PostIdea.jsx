import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User as RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './PostIdea.css';

const PostIdea = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'SaaS',
    description: '',
    fundingRequired: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to post an idea');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .insert([
          {
            title: formData.title,
            category: formData.category,
            description: formData.description,
            funding_required: formData.fundingRequired,
            author_id: user.id,
            author_name: user.user_metadata.full_name || user.email.split('@')[0],
            author_role: user.user_metadata.role || 'normal',
            author_email: user.email,
            author_phone: user.user_metadata.phone_number || 'Not provided',
            likes: 0,
          }
        ]);

      if (error) throw error;

      alert('Idea published successfully!');
      navigate('/feed');
    } catch (error) {
      alert('Error publishing idea: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-container container">
      <div className="post-wrapper glass-panel animate-fade-in">
        <header className="post-header">
          <h1 className="text-gradient">Post Your Idea</h1>
          <p className="text-muted">Share your vision with the community and find the right people to make it happen.</p>
        </header>

        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Idea Title</label>
            <input 
              type="text" 
              id="title" 
              name="title"
              className="input-glass" 
              placeholder="e.g., AI-Powered Peer Tutoring Network"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category" 
              name="category"
              className="input-glass select-glass"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="SaaS">SaaS</option>
              <option value="EdTech">EdTech</option>
              <option value="CleanTech">CleanTech</option>
              <option value="FinTech">FinTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description</label>
            <textarea 
              id="description" 
              name="description"
              className="input-glass textarea-glass" 
              placeholder="Describe your idea, what problem it solves, and who you are looking for (e.g., Technical Co-founder, Seed Investors)."
              rows="6"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="fundingRequired">Funding Required (Optional)</label>
            <input 
              type="text" 
              id="fundingRequired" 
              name="fundingRequired"
              className="input-glass" 
              placeholder="e.g., $100k Pre-Seed"
              value={formData.fundingRequired}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <><Send size={18} /> Publish Idea</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostIdea;
