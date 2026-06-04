import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import TimerPill from './TimerPill';

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/materials':  'My Materials',
  '/flashcards': 'Flashcards',
  '/calendar':   'Study Calendar',
};

const Navbar = ({ isCollapsed, setCollapsed, darkMode, setDarkMode }) => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'StudyFlow';

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', next);
  };

  return (
    <header
      className={`
        fixed top-0 right-0 z-10 h-14 flex items-center px-4 gap-4
        glass-card border-b border-white/20
        transition-all duration-300
        ${isCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'}
      `}
    >
      {/* Mobile menu toggle */}
      <button
        id="btn-menu-toggle"
        onClick={() => setCollapsed(!isCollapsed)}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar toggle */}
      <button
        id="btn-sidebar-toggle"
        onClick={() => setCollapsed(!isCollapsed)}
        className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-4 h-4 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-dark-surface dark:text-white flex-1">
        {title}
      </h1>

      {/* Timer pill — always visible */}
      <TimerPill />

      {/* Dark mode toggle */}
      <button
        id="btn-dark-mode"
        onClick={toggleDark}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-dark-muted"
        aria-label="Toggle dark mode"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
};

export default Navbar;
