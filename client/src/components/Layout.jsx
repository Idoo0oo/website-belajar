import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AmbientPlayer from './AmbientPlayer';
import ChangePasswordModal from './ChangePasswordModal';
import { MailWarning, X } from 'lucide-react';

const Layout = () => {
  const [isCollapsed, setCollapsed] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === null ? true : saved === 'true';
  });
  const [showChangePw, setShowChangePw] = useState(false);
  const [showVerifyBanner, setShowVerifyBanner] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email_verified === false;
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} onChangePw={() => setShowChangePw(true)} />

      <div
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-300
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}
      >
        <Navbar
          isCollapsed={isCollapsed}
          setCollapsed={setCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Email verification banner */}
        {showVerifyBanner && (
          <div className="fixed top-14 left-0 right-0 z-30 bg-amber-500/90 backdrop-blur-sm flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2 text-dark-base text-sm font-medium">
              <MailWarning size={16} />
              Please verify your email address. Check your inbox for a verification link.
            </div>
            <button onClick={() => setShowVerifyBanner(false)} className="text-dark-base hover:text-black">
              <X size={16} />
            </button>
          </div>
        )}

        <main className={`flex-1 overflow-auto pb-14 ${showVerifyBanner ? 'pt-22' : 'pt-14'}`}>
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>

        <AmbientPlayer isCollapsed={isCollapsed} />
      </div>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  );
};

export default Layout;
