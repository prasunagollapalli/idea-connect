import { useEffect, useState } from 'react';
import { Lightbulb, Users, Activity, Briefcase } from 'lucide-react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [phase, setPhase] = useState(1); // 1: Idea, 2: Connect, 3: Business

  useEffect(() => {
    const p1 = setTimeout(() => setPhase(2), 1200);
    const p2 = setTimeout(() => setPhase(3), 2800);
    const p3 = setTimeout(() => setIsFadingOut(true), 4500);
    const p4 = setTimeout(() => onComplete(), 5300);

    return () => {
      [p1, p2, p3, p4].forEach(clearTimeout);
    };
  }, [onComplete]);

  // Generate some background particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 4 + 2}px`,
    delay: `${Math.random() * 10}s`,
    duration: `${Math.random() * 10 + 10}s`,
  }));

  return (
    <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
      {particles.map(p => (
        <div 
          key={p.id} 
          className="particle" 
          style={{ 
            top: p.top, 
            left: p.left, 
            width: p.size, 
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}

      <div className="workflow-container">
        <svg className="connector-svg" viewBox="0 0 400 400">
          <line x1="200" y1="200" x2="100" y2="100" className={`line ${phase >= 2 ? 'draw' : ''}`} />
          <line x1="200" y1="200" x2="300" y2="100" className={`line ${phase >= 2 ? 'draw' : ''}`} />
          <line x1="200" y1="200" x2="200" y2="320" className={`line ${phase >= 2 ? 'draw' : ''}`} />
        </svg>

        {/* Central Node: Idea */}
        <div className={`node center-node ${phase >= 1 ? 'visible' : ''} ${phase === 3 ? 'scale-up' : ''}`}>
          <div className="node-glow"></div>
          <Lightbulb size={36} color="#fff" strokeWidth={2.5} />
          <span className="node-label">The Spark</span>
        </div>

        {/* Outer Nodes */}
        <div className={`node outer-node team-node ${phase >= 2 ? 'visible' : ''}`}>
          <div className="node-glow secondary"></div>
          <Users size={24} color="#fff" />
          <span className="node-label">The Team</span>
        </div>

        <div className={`node outer-node capital-node ${phase >= 2 ? 'visible' : ''}`}>
          <div className="node-glow accent"></div>
          <Activity size={24} color="#fff" />
          <span className="node-label">The Capital</span>
        </div>

        <div className={`node outer-node business-node ${phase >= 2 ? 'visible' : ''}`}>
          <div className="node-glow primary"></div>
          <Briefcase size={24} color="#fff" />
          <span className="node-label">The Business</span>
        </div>

        {/* Final Branding Overlay */}
        <div className={`brand-overlay ${phase === 3 ? 'visible' : ''}`}>
          <h1 className="splash-title text-gradient">IdeaConnect</h1>
          <p className="splash-tagline">SCALING AMBITION INTO REALITY</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
