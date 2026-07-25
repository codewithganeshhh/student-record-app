import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      onLogin({ token: res.data.token, role: res.data.role });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/logo.png" 
            alt="PaulTech Software Services" 
            style={{ 
              maxWidth: '220px', 
              width: '100%', 
              height: 'auto', 
              display: 'block', 
              margin: '0 auto 1rem'
            }} 
          />
          <p style={{ color: 'var(--text-secondary)' }}>Student Record System</p>
        </div>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <p>Admin: admin / admin123</p>
          <p>Developer: dev / dev123</p>
        </div>
      </div>
    </div>
  );
}
