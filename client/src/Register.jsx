import { useState } from "react";
import axios from "axios";
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password required');
      return;
    }
    try {
      await axios.post(`${API}/register`, { username, password }, { withCredentials: true });
      onRegister(); // tell App to switch to login or log in
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="app-container">
      <h1>Register</h1>
      
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
          <button onClick={handleRegister} className="auth-btn primary">Register</button>
          <button onClick={onSwitchToLogin} className="auth-btn secondary">Back to Login</button>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}
