import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, HelpCircle, FileSpreadsheet, LogOut, X, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { exportToExcel } from '../utils/exportToExcel';

export default function Sidebar({ user, onLogout, isOpen, onClose, darkMode, onToggleDarkMode }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const handleExportAll = async () => {
    try {
      const [studentsRes, enquiriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/students`, { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get(`${API_BASE_URL}/api/enquiries`, { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      const studentCols = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Domain', key: 'domain' },
        { label: 'Joining Date', key: 'joining_date' },
        { label: 'Duration (Months)', key: 'duration' },
        { label: 'Status', key: 'status' }
      ];

      exportToExcel(studentsRes.data, studentCols, 'Students_Record');
    } catch (err) {
      alert('Error exporting data');
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Mobile Close Button */}
      <button 
        className="sidebar-close-btn" 
        onClick={onClose}
        title="Close navigation menu"
      >
        <X size={20} />
      </button>

      <div style={{ marginBottom: '3rem' }}>
        <img 
          src="/logo.png" 
          alt="PaulTech Software Services" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto', 
            display: 'block'
          }} 
        />
        <div className="badge badge-domain" style={{ marginTop: '0.75rem', textTransform: 'none' }}>
          {user.role === 'ADMIN' ? 'Mrs. Daljeet Paul' : user.role}
        </div>
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link 
          to="/dashboard" 
          onClick={onClose}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)',
            background: isActive('/dashboard') ? 'rgba(0, 120, 212, 0.08)' : 'transparent',
            color: isActive('/dashboard') ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: isActive('/dashboard') ? 600 : 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link 
          to="/students" 
          onClick={onClose}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)',
            background: isActive('/students') ? 'rgba(0, 120, 212, 0.08)' : 'transparent',
            color: isActive('/students') ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: isActive('/students') ? 600 : 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={20} />
          Students
        </Link>
        <Link 
          to="/enquiries" 
          onClick={onClose}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)',
            background: isActive('/enquiries') ? 'rgba(0, 120, 212, 0.08)' : 'transparent',
            color: isActive('/enquiries') ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: isActive('/enquiries') ? 600 : 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <HelpCircle size={20} />
          Enquiries
        </Link>

        <button 
          onClick={() => {
            handleExportAll();
            onClose();
          }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: '#107c41',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
          title="Export records to Excel sheet"
        >
          <FileSpreadsheet size={20} />
          Export Excel
        </button>
      </nav>

      <button 
        className="theme-toggle-btn" 
        onClick={onToggleDarkMode}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <button className="btn btn-secondary" onClick={onLogout} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '0.25rem' }}>
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}

