import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, Search, Loader2, Activity, MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import IdeaCard from '../components/IdeaCard';
import './Feed.css';

const Feed = () => {
  const location = useLocation(); // track navigation
  const [ideas, setIdeas] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'EdTech', 'SaaS', 'CleanTech', 'FinTech', 'HealthTech', 'Other'];

  // Re-fetch whenever filter changes OR whenever we navigate back to this page
  useEffect(() => {
    fetchIdeas();
    fetchAnnouncements();
  }, [activeFilter, location.key]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error.message);
    }
  };

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeFilter !== 'All') {
        query = query.eq('category', activeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mappedIdeas = data.map(item => ({
        ...item,
        author_name: item.author_name,
        author_role: item.author_role,
        author_email: item.author_email,
        author_phone: item.author_phone,
        funding_required: item.funding_required
      }));

      setIdeas(mappedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredIdeas = ideas.filter(idea => 
    (idea.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (idea.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (idea.author?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="feed-container container">
      <div className="feed-main-layout">
        <div className="feed-content-area">
          <header className="feed-header">
            <h1 className="text-gradient">Idea Feed</h1>
            <p className="text-muted">Discover and connect with the next big thing.</p>
          </header>

          <div className="feed-controls">
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search ideas..." 
                className="input-glass"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              {filters.map(filter => (
                <button 
                  key={filter}
                  className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loader-container">
              <Loader2 className="animate-spin" size={48} color="var(--primary)" />
              <p>Loading the latest ideas...</p>
            </div>
          ) : (
            <div className="ideas-grid">
              {filteredIdeas.length > 0 ? (
                filteredIdeas.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))
              ) : (
                <div className="no-results glass-panel">
                  <h3>No ideas found</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="feed-sidebar">
          <div className="announcements-widget glass-panel">
            <div className="widget-header">
              <MessageCircle size={20} className="text-gradient" />
              <h3>Announcements</h3>
            </div>
            <div className="announcements-list">
              {announcements.length > 0 ? (
                announcements.map(ann => (
                  <div key={ann.id} className="announcement-item">
                    <span className={`ann-type ${ann.type}`}>{ann.type}</span>
                    <h4>{ann.title}</h4>
                    <p>{ann.content}</p>
                    <span className="ann-date">{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p className="no-ann">No platform updates at this time.</p>
              )}
            </div>
          </div>

          <div className="trending-widget glass-panel">
            <h3>Quick Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Active Ideas</span>
              <span className="stat-value">{ideas.length}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Feed;
