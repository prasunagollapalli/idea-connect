import './RoleBadge.css';

const RoleBadge = ({ role }) => {
  const getRoleConfig = () => {
    if (!role) return { color: 'var(--text-muted)', bg: 'rgba(148, 163, 184, 0.1)', label: 'User' };
    
    switch (role.toLowerCase()) {
      case 'normal':
      case 'student':
        return { color: 'var(--secondary)', bg: 'rgba(6, 182, 212, 0.1)', label: 'Normal' };
      case 'startup':
      case 'founder':
        return { color: 'var(--primary)', bg: 'rgba(139, 92, 246, 0.1)', label: 'Startup' };
      case 'investor':
        return { color: 'var(--accent)', bg: 'rgba(244, 63, 94, 0.1)', label: 'Investor' };
      case 'admin':
        return { color: '#ffcc00', bg: 'rgba(255, 204, 0, 0.1)', label: 'Admin' };
      default:
        return { color: 'var(--text-muted)', bg: 'rgba(148, 163, 184, 0.1)', label: role };
    }
  };

  const config = getRoleConfig();

  return (
    <span 
      className="role-badge" 
      style={{ 
        color: config.color, 
        backgroundColor: config.bg,
        border: `1px solid ${config.color}40`
      }}
    >
      {config.label}
    </span>
  );
};

export default RoleBadge;
