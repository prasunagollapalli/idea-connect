import { useState, useEffect } from 'react';
import { Heart, Share2, Mail, Phone } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';
import './IdeaCard.css';

const IdeaCard = ({ idea }) => {
  const { user } = useAuth();
  // Read likes from DB always — never from stale prop
  const [likes, setLikes] = useState(idea.likes ?? 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Refresh likes count from DB so refresh doesn't lose data
    refreshLikes();
    if (user) checkIfLiked();
  }, [user, idea.id]);

  const refreshLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('likes')
        .eq('id', idea.id)
        .single();
      if (!error && data) setLikes(data.likes ?? 0);
    } catch (_) {}
  };

  const checkIfLiked = async () => {
    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('idea_id', idea.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setIsLiked(true);
    } catch (_) {}
  };

  const handleLike = async () => {
    if (!user) return alert('Please log in to like ideas!');

    try {
      if (isLiked) {
        // ── UNLIKE ──
        const { error: delError } = await supabase
          .from('likes')
          .delete()
          .eq('idea_id', idea.id)
          .eq('user_id', user.id);
        
        if (delError) console.error("Unlike error:", delError);

        // Optimistically update UI
        setLikes(Math.max(0, likes - 1));
        setIsLiked(false);
      } else {
        // ── LIKE ──
        const { error: likeError } = await supabase
          .from('likes')
          .insert([{ idea_id: idea.id, user_id: user.id }]);
        
        if (likeError) console.error("Like error:", likeError);

        // Optimistically update UI
        setLikes(likes + 1);
        setIsLiked(true);
      }
    } catch (err) {
      console.error('Error toggling like:', err.message);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: idea.title, text: idea.description, url: window.location.origin + '/feed' });
      } else {
        await navigator.clipboard.writeText(window.location.origin + '/feed');
        alert('Link copied to clipboard!');
      }
    } catch (_) {}
  };

  return (
    <article className="idea-card glass-panel">
      {/* ── Header: Author name + role ── */}
      <div className="card-header">
        <div className="author-info">
          <div className="avatar">{(idea.author_name || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="author-name">{idea.author_name || 'Anonymous'}</h3>
            <RoleBadge role={idea.author_role} />
          </div>
        </div>
        <span className="category-tag">{idea.category}</span>
      </div>

      {/* ── Body ── */}
      <div className="card-body">
        <h2 className="idea-title">{idea.title}</h2>
        <p className="idea-description">{idea.description}</p>

        {idea.funding_required && (
          <div className="funding-goal">
            <span className="funding-label">Funding Required:</span>
            <span className="funding-amount">{idea.funding_required}</span>
          </div>
        )}

        {/* Contact info block */}
        <div className="card-contact-box glass-panel">
          <div className="contact-row">
            <div className="contact-label">
              <Mail size={14} />
              <span>Email:</span>
            </div>
            <span className="contact-value">{idea.author_email || '—'}</span>
          </div>
          <div className="contact-row">
            <div className="contact-label">
              <Phone size={14} />
              <span>Phone:</span>
            </div>
            <span className="contact-value">{idea.author_phone || '—'}</span>
          </div>
        </div>
      </div>

      {/* ── Footer: Like + Share ── */}
      <div className="card-footer">
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          title={isLiked ? 'Unlike this idea' : 'Like this idea'}
        >
          <Heart size={18} fill={isLiked ? 'var(--accent)' : 'none'} color={isLiked ? 'var(--accent)' : 'currentColor'} />
          <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
        </button>

        <button className="action-btn share-btn" onClick={handleShare}>
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
};

export default IdeaCard;
