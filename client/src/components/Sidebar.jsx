import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Package,
  Inbox, Zap, BarChart2,
  Sun, Moon, LogOut, Users as UsersIcon
} from 'lucide-react';

const warehouseItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/receiving', icon: Inbox, label: 'Receive Stock' },
  { to: '/orders', icon: Zap, label: 'Picking' },
];

const insightItems = [
  { to: '/activity', icon: BarChart2, label: 'Reports' },
];

const adminItems = [
  { to: '/users', icon: UsersIcon, label: 'Users' },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const NavSection = ({ title, items }) => (
    <div style={{ marginBottom: '22px' }}>
      <p style={{
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        padding: '0 14px',
        margin: '0 0 8px',
        textTransform: 'uppercase',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sf-nav-item ${isActive ? 'sf-nav-item--active' : ''}`}
          >
            <item.icon size={18} className="sf-nav-icon" />
            <span className="sf-nav-text">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .sf-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--sidebar-width);
          z-index: 40;
          display: flex;
          flex-direction: column;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          transition: background-color 0.2s ease, border-color 0.2s ease, width 0.2s ease;
          box-shadow: 1px 0 10px rgba(0, 0, 0, 0.02);
        }

        .sf-logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 18px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .sf-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--accent), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px var(--accent-dim);
        }

        .sf-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .sf-logo-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .sf-logo-sub {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .sf-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0 12px;
        }

        .sf-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.15s ease;
          position: relative;
        }

        .sf-nav-item:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .sf-nav-item--active {
          background: var(--accent-dim);
          color: var(--accent);
          font-weight: 600;
        }

        .sf-nav-item--active .sf-nav-icon {
          color: var(--accent);
        }

        .sf-nav-icon {
          flex-shrink: 0;
          color: var(--text-muted);
          transition: color 0.15s ease;
        }

        .sf-nav-item:hover .sf-nav-icon {
          color: var(--text-primary);
        }

        .sf-bottom {
          padding: 14px 12px 18px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sf-mode-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          background: var(--bg-card);
          border: 1px solid var(--border);
          width: 100%;
        }

        .sf-mode-toggle:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--accent-border);
        }

        .sf-mode-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 10.5px;
          font-weight: 600;
          background: var(--accent-dim);
          color: var(--accent);
        }

        .sf-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 9px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transition: background 0.15s ease;
        }

        .sf-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          flex-shrink: 0;
        }

        .sf-user-info {
          flex: 1;
          min-width: 0;
        }

        .sf-user-name {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sf-user-role {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: capitalize;
        }

        .sf-logout-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .sf-logout-btn:hover {
          background: var(--badge-danger-bg);
          color: var(--badge-danger-text);
        }
      `}</style>

      <aside className="sf-sidebar">
        {/* Logo area */}
        <div className="sf-logo-area">
          <div className="sf-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div className="sf-logo-text">
            <span className="sf-logo-name">StackFlow</span>
            <span className="sf-logo-sub">Warehouse OS</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="sf-nav">
          <NavSection title="Warehouse" items={warehouseItems} />
          <NavSection title="Insights" items={insightItems} />
          {isAdmin() && <NavSection title="Administration" items={adminItems} />}
        </nav>

        {/* Bottom controls */}
        <div className="sf-bottom">
          {/* Theme switcher toggle button */}
          <button
            type="button"
            className="sf-mode-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDark ? <Sun size={15} style={{ color: '#FBBF24' }} /> : <Moon size={15} style={{ color: 'var(--accent)' }} />}
              <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
            </div>
            <span className="sf-mode-pill">
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* User information badge */}
          <div className="sf-user">
            <div className="sf-avatar">{initials}</div>
            <div className="sf-user-info">
              <div className="sf-user-name" title={user?.name || 'User'}>
                {user?.name || 'User'}
              </div>
              <div className="sf-user-role">
                {user?.role === 'warehouse_manager'
                  ? 'Warehouse Manager'
                  : user?.role?.replace('_', ' ') || 'Staff'}
              </div>
            </div>
            <button
              className="sf-logout-btn"
              onClick={handleLogout}
              title="Log out of StackFlow"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
