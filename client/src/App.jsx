import { useState, useEffect } from "react";
import './App.css';
import axios from "axios";

const API = 'http://localhost:5000'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')

  // fetches tasks from the server, passing the current filter as a query 
  const fetchTasks = async () => {
    const url = filter === 'all' ? `${API}/tasks` : `${API}/tasks?filter=${filter}`;
    const { data } = await axios.get(url); // axios.get returns a response object; .data is the JSON body
    setTasks(data); // Update state with the fetched tasks, triggering a re-render
  }

  // re-fetch tasks whenever filter changes
  useEffect(() => { fetchTasks();}, [filter])

  // sends POST request to create a new tasks, then refreshes the list.
  const addTask = async () => {
    if (!input.trim()) return; // Don't submit if the input is empty or just whitespace
    await axios.post(`${API}/tasks`, { title: input, dueDate });
    // using useState stuffs
    setInput(''); // Clear the input field after submitting
    setDueDate('')
    fetchTasks(); // Refresh the task list to show the new task
  }

  const toggleTask = async (task) => {
  await axios.put(`${API}/tasks/${task._id}`, { completed: !task.completed });
  fetchTasks();
};

    // Sends a DELETE request for the given task ID, then refreshes the list
  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`);
    fetchTasks();
  };


  return (
  <div className="app-container">
    <h1>To-Do</h1>

    <div className="add-task-row">
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="New task..." />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          placeholder="Due date"
          style={{ marginLeft: 8 }}
        />
      <button onClick={addTask}>Add</button>
    </div>

    <div className="filter-row">
      {['all', 'completed'].map(f => (
        <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'active' : ''}>
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
    <div className="tasks-list">
      {tasks.map(task => (
        <div className="task-card" key={task._id}>
          <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} />
          <span className={`task-title${task.completed ? ' completed' : ''}`}>{task.title}</span>
          <div className="task-dates">
            {task.dueDate && (
              <span className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
            {task.createdAt && (
              <span className="created-date">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            )}
          </div>
          <button className="delete-btn" onClick={() => deleteTask(task._id)} title="Delete">✕</button>
        </div>
      ))}
    </div>
  </div>
);
}
