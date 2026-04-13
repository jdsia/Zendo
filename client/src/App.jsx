import { useState, useEffect } from "react";
import axios from "axios";

const API = 'http://localhost:5000'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
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
    await axios.post(`${API}/tasks`, { title: input });
    // using useState stuffs
    setInput(''); // Clear the input field after submitting
    fetchTasks(); // Refresh the task list to show the new task
  }

  // sends a PUT requrest toggling the copleted field
  //const toggleTask = async (task) => {
  //  console.log('full task object:', task)
  //  await axios.put(`${API}/tasks/${task.id}`, { completed: !task.completed})
  //  fetchTasks(); // refreshes list

  //}

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
  <div style={{ maxWidth: 500, margin: '2rem auto', fontFamily: 'sans-serif' }}>
    <h1>To-Do</h1>

    <input value={input} onChange={e => setInput(e.target.value)} placeholder="New task..." />
    <button onClick={addTask}>Add</button>

    <div>
      {['all', 'completed'].map(f => (
        <button key={f} onClick={() => setFilter(f)} style={{ fontWeight: filter === f ? 'bold' : 'normal' }}>
          {f}
        </button>
      ))}
    </div>

    {tasks.map(task => (
      <div key={task._id}>
        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} />
        <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
        <button onClick={() => deleteTask(task._id)}>✕</button>
      </div>
    ))}
  </div>
);


}
