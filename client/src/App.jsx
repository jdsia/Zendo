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
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', priority: 'Medium', dueDate: '' })
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');

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
    .then((response) => {
      setIsLoggedIn(true);
      setUsername(response.data.username);
    })
    .catch((response) => {
      setIsLoggedIn(false);
      setUsername('');
    });
}, []);

  // sends POST request to create a new tasks, then refreshes the list.
  const addTask = async () => {
    setError('');
    if (!input.trim()) {
      setError('Task title is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/tasks`, { 
        title: input.trim(), 
        priority, 
        dueDate: dueDate || null 
      }, {withCredentials: true});
      // using useState stuffs
      setInput(''); // Clear the input field after submitting
      setPriority('Medium');
      setDueDate('');
      fetchTasks(); // Refresh the task list to show the new task
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  }


    // Sends a DELETE request for the given task ID, then refreshes the list
  const deleteTask = async (id) => {
    setError('');
    setLoading(true);
    try {
      await axios.delete(`${API}/tasks/${id}`, { withCredentials: true});
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    setError('');
    try {
      await axios.put(`${API}/tasks/${task._id}`, { completed: !task.completed }, { withCredentials: true });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const startEdit = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditForm({ title: '', priority: 'Medium', dueDate: '' });
  };

  const saveEdit = async () => {
    if (!editForm.title.trim()) {
      setError('Task title is required');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${API}/tasks/${editingTask}`, {
        title: editForm.title.trim(),
        priority: editForm.priority,
        dueDate: editForm.dueDate || null
      }, { withCredentials: true });
      cancelEdit();
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const logout = async () => {
  await axios.post(`${API}/logout`, {}, { withCredentials: true }); // 🔥 include credentials
  setIsLoggedIn(false);
};

  if (!isLoggedIn) {
    if (showRegister) {
      return <Register onRegister={() => { setShowRegister(false); fetchTasks(); }} onSwitchToLogin={() => setShowRegister(false)} />
    }
  return <Login onLogin={() => { setIsLoggedIn(true); fetchTasks(); }} onShowRegister={() => setShowRegister(true)} />
  }
  return (
  <div className="app-container">
    <h1>Tasker</h1>
    <div className="current-user">Current User: {username}</div>
    
    <button onClick={logout} className="delete-btn" style={{float: 'right', marginTop: '-3rem'}}>Logout</button>

    {error && <div className="auth-error">{error}</div>}
    
    <div className="add-task-row">
      <input 
        value={input} 
        onChange={e => setInput(e.target.value)} 
        placeholder="New task..." 
        disabled={loading}
      />
      <select 
        value={priority} 
        onChange={e => setPriority(e.target.value)}
        disabled={loading}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <input 
        type="date" 
        value={dueDate} 
        onChange={e => setDueDate(e.target.value)}
        disabled={loading}
      />
      <button onClick={addTask} disabled={loading}>
        {loading ? 'Adding...' : 'Add'}
      </button>
    </div>

    <div className="search-filter-row">
      <input 
        type="text" 
        placeholder="Search tasks..." 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
      />
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
    </div>

    <div className="tasks-list">
      {loading && <div className="loading">Loading...</div>}
      {!loading && filteredTasks.length === 0 && (
        <div className="no-tasks">
          {searchTerm ? 'No tasks found matching your search' : 'No tasks yet. Add one above!'}
        </div>
      )}
      {!loading && filteredTasks.map(task => (
        <div key={task._id} className="task-card">
          {editingTask === task._id ? (
            <div className="edit-form">
              <input 
                type="text" 
                value={editForm.title}
                onChange={e => setEditForm({...editForm, title: e.target.value})}
                className="edit-input"
              />
              <select 
                value={editForm.priority} 
                onChange={e => setEditForm({...editForm, priority: e.target.value})}
                className="edit-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <input 
                type="date" 
                value={editForm.dueDate} 
                onChange={e => setEditForm({...editForm, dueDate: e.target.value})}
                className="edit-date"
              />
              <div className="edit-buttons">
                <button onClick={saveEdit} className="save-btn">Save</button>
                <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
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
              <div className="task-actions">
                <button onClick={() => startEdit(task)} className="edit-btn">✏️</button>
                <button onClick={() => deleteTask(task._id)} className="delete-btn">✕</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);


}
