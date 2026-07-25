import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDirectory from './pages/StudentDirectory';
import Enquiries from './pages/Enquiries';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Mobile Top Navigation Bar */}
        <header className="mobile-header">
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-primary)',
              padding: '0.25rem'
            }}
            title="Open navigation menu"
          >
            <Menu size={24} />
          </button>
          <img 
            src="/logo.png" 
            alt="PaulTech Logo" 
            style={{ height: '28px', width: 'auto', display: 'block' }} 
          />
          <div style={{ width: '32px' }}></div> {/* Spacer for alignment balance */}
        </header>

        {/* Sidebar Drawer Backdrop overlay */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar 
          user={user} 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          onLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setUser(null);
          }} 
        />
        <main className="main-content animate-fade-in">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/students" element={<StudentDirectory user={user} />} />
            <Route path="/enquiries" element={<Enquiries user={user} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

