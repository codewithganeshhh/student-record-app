import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDirectory from './pages/StudentDirectory';
import Enquiries from './pages/Enquiries';
import Sidebar from './components/Sidebar';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar user={user} onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setUser(null);
        }} />
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
