import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Layers, CalendarDays, LogOut, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',           label: 'Dashboard',  icon: <LayoutDashboard size={20} /> },
  { to: '/materials',  label: 'Materials',  icon: <FileText size={20} /> },
  { to: '/flashcards', label: 'Flashcards', icon: <Layers size={20} /> },
  { to: '/calendar',   label: 'Calendar',   icon: <CalendarDays size={20} /> },
];

const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-all duration-300 ease-in-out
          glass-card border-r border-white/20
          ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-5 border-b border-white/10 ${isCollapsed ? 'lg:justify-center lg:px-3' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lavender to-misty flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <p className="text-sm font-bold text-dark-surface dark:text-white leading-tight">StudyFlow</p>
              <p className="text-xs text-dark-muted">Focus · Rest · Grow</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              id={`nav-${label.toLowerCase()}`}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-lavender/25 text-dark-surface dark:text-white shadow-sm'
                  : 'text-dark-muted hover:bg-white/10 hover:text-dark-surface dark:hover:text-white'
                }
                ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              `}
            >
              <span className="shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
              {!isCollapsed && <span className="animate-fade-in">{label}</span>}
            </NavLink>
          ))}

          {user.role === 'superadmin' && (
            <>
              <div className="my-2 border-t border-white/5 mx-2"></div>
              <NavLink
                to="/admin"
                id="nav-admin"
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-red-400/20 text-red-400 shadow-sm'
                    : 'text-red-400/70 hover:bg-red-400/10 hover:text-red-400'
                  }
                  ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
              >
                <span className="shrink-0 group-hover:scale-110 transition-transform"><Settings size={20} /></span>
                {!isCollapsed && <span className="animate-fade-in">Admin Panel</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* User section */}
        <div className={`p-3 border-t border-white/10 ${isCollapsed ? 'lg:flex lg:justify-center' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sage to-misty flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-dark-surface dark:text-white truncate">{user.name || 'Student'}</p>
                <p className="text-xs text-dark-muted truncate">{user.email || ''}</p>
              </div>
            </div>
          ) : null}
          <button
            id="btn-logout"
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium
              text-dark-muted hover:bg-red-500/10 hover:text-red-400
              transition-all duration-200
              ${isCollapsed ? 'lg:justify-center' : ''}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
