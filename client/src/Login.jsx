import { useState } from "react";
import axios from "axios";
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password required');
      return;
    }
    try {
      await axios.post(`${API}/login`, {
        username,
        password
      }, { withCredentials: true });

      onLogin(); // tell App we are logged in
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="app-container">
      <h1>Login</h1>
      
      <div className="auth-form">
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="auth-input"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="auth-input"
        />
        
        <div className="auth-buttons">
          <button onClick={handleLogin} className="auth-btn primary">Login</button>
          <button onClick={onShowRegister} className="auth-btn secondary">Register</button>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}
