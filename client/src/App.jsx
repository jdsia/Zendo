import { useState, useEffect } from "react";
import axios from "axios";
import Login from './Login'
import Register from './Register'
import './App.css'

const API = 'http://localhost:5000'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // fetches tasks from the server, passing the current filter as a query 
  const fetchTasks = async () => {
    const url = filter === 'all' ? `${API}/tasks` : `${API}/tasks?filter=${filter}`;
    const { data } = await axios.get(url, { withCredentials: true }); // axios.get returns a response object; .data is the JSON body
    setTasks(data); // Update state with the fetched tasks, triggering a re-render
  }

  // re-fetch tasks whenever filter changes
  useEffect(() => { fetchTasks();}, [filter])

  useEffect(() => {
  axios.get(`${API}/profile`, { withCredentials: true })
    .then(() => setIsLoggedIn(true))   // ✅ still logged in
    .catch(() => setIsLoggedIn(false)) // ❌ not logged in
}, []);

  // sends POST request to create a new tasks, then refreshes the list.
  const addTask = async () => {
    if (!input.trim()) return; // Don't submit if the input is empty or just whitespace
    await axios.post(`${API}/tasks`, { 
      title: input, 
      priority, 
      dueDate: dueDate || null 
    }, {withCredentials: true});
    // using useState stuffs
    setInput(''); // Clear the input field after submitting
    setPriority('Medium');
    setDueDate('');
    fetchTasks(); // Refresh the task list to show the new task
  }


    // Sends a DELETE request for the given task ID, then refreshes the list
  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`, { withCredentials: true});
    fetchTasks();
  };

  const toggleTask = async (task) => {
  await axios.put(`${API}/tasks/${task._id}`, { completed: !task.completed }, { withCredentials: true });
  fetchTasks();
};

  const logout = async () => {
  await axios.post(`${API}/logout`, {}, { withCredentials: true }); // 🔥 include credentials
  setIsLoggedIn(false);
};

  if (!isLoggedIn) {
    if (showRegister) {
      return <Register onRegister={() => setShowRegister(false)} onSwitchToLogin={() => setShowRegister(false)} />
    }
  return <Login onLogin={() => setIsLoggedIn(true)} onShowRegister={() => setShowRegister(true)} />
  }
  return (
  <div className="app-container">
    <h1>To-Do</h1>
    <button onClick={logout} className="delete-btn" style={{float: 'right', marginTop: '-3rem'}}>Logout</button>

    <div className="add-task-row">
      <input 
        value={input} 
        onChange={e => setInput(e.target.value)} 
        placeholder="New task..." 
      />
      <select 
        value={priority} 
        onChange={e => setPriority(e.target.value)}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <input 
        type="date" 
        value={dueDate} 
        onChange={e => setDueDate(e.target.value)}
      />
      <button onClick={addTask}>Add</button>
    </div>

    <div className="filter-row">
      {['all', 'completed'].map(f => (
        <button 
          key={f} 
          onClick={() => setFilter(f)} 
          className={filter === f ? 'active' : ''}
        >
          {f}
        </button>
      ))}
    </div>

    <div className="tasks-list">
      {tasks.map(task => (
        <div key={task._id} className="task-card">
          <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={() => toggleTask(task)} 
          />
          <div className="task-content">
            <span className={`task-title ${task.completed ? 'completed' : ''}`}>
              {task.title}
              <span className={`task-priority priority-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </span>
            <div className="task-dates">
              {task.dueDate && <span className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
              <span className="created-date">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={() => deleteTask(task._id)} className="delete-btn">✕</button>
        </div>
      ))}
    </div>
  </div>
);


}
