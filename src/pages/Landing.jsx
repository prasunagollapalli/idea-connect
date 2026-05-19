import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info as Sparkles, Users, Activity as Rocket, MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Landing.css';

const Landing = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % announcements.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(timer);
    }
  }, [announcements]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAnnouncements(data);
      } else {
        // Fallback mock data if database is empty
        setAnnouncements([
          { id: 1, content: "🚀 Welcome to IdeaConnect! Start posting your visions today." },
          { id: 2, content: "💎 Investor Spotlight: Silicon Valley scouts are joining the platform." },
          { id: 3, content: "🛠️ New Feature: You can now add role-based tags to your profile." }
        ]);
      }
    } catch (err) {
      console.error('Error fetching landing announcements:', err);
      // Fallback on error too
      setAnnouncements([
        { id: 1, content: "🚀 Connect with founders and investors worldwide." }
      ]);
    }
  };

  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-content text-center">
          <div className="badge animate-fade-in stagger-1">
            <Sparkles size={16} className="text-secondary" />
            <span>The ultimate networking platform</span>
          </div>
          
          <h1 className="hero-title animate-fade-in stagger-2">
            Where <span className="text-gradient">Ideas</span> Meet <br />
            Their Makers & Backers
          </h1>
          
          <p className="hero-subtitle animate-fade-in stagger-3">
            Connect with visionary students, driven founders, and strategic investors.
            Post your ideas, find your co-founder, or discover the next unicorn.
          </p>
          
          <div className="hero-actions animate-fade-in stagger-3">
            <Link to="/feed" className="btn-primary hero-btn">
              Explore Ideas <ArrowRight size={20} />
            </Link>
            <Link to="/post" className="btn-outline hero-btn">
              Post an Idea
            </Link>
          </div>

          {/* Announcements Slider */}
          {announcements.length > 0 && (
            <div className="announcement-slider-wrapper animate-fade-in stagger-3">
              <div className="slider-label">
                <MessageCircle size={14} />
                <span>LATEST UPDATES</span>
              </div>
              <div className="slider-track">
                {announcements.map((ann, index) => (
                  <div 
                    key={ann.id} 
                    className={`announcement-slide ${index === currentSlide ? 'active' : ''}`}
                  >
                    <p>{ann.content}</p>
                  </div>
                ))}
              </div>
              <div className="slider-dots">
                {announcements.map((_, index) => (
                  <div 
                    key={index} 
                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon bg-primary-glow">
              <Users size={24} color="var(--primary)" />
            </div>
            <h3>For Students</h3>
            <p>Find real-world projects to work on, build your portfolio, and connect with experienced founders.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon bg-secondary-glow">
              <Rocket size={24} color="var(--secondary)" />
            </div>
            <h3>For Founders</h3>
            <p>Pitch your startup ideas, recruit talented students, and attract early-stage investment.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon bg-accent-glow">
              <Sparkles size={24} color="var(--accent)" />
            </div>
            <h3>For Investors</h3>
            <p>Discover vetted, high-potential ideas and connect directly with passionate founding teams.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
