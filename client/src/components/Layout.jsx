import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AmbientPlayer from './AmbientPlayer';

const Layout = () => {
  const [isCollapsed, setCollapsed] = useState(true); // mobile: collapsed by default
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />

      {/* Main content area */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-300
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}
      >
        {/* Top navbar — fixed, above content */}
        <Navbar
          isCollapsed={isCollapsed}
          setCollapsed={setCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Page content — padded for navbar (top) + player (bottom) */}
        <main className="flex-1 pt-14 pb-14 overflow-auto">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Ambient audio player — fixed, below content */}
        <AmbientPlayer isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Layout;
