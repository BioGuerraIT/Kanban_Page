import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import Task from "./Task";
import TaskForm from './TaskForm';

const initialColumns = {
  todo: [],
  inProgress: [],
  review: [],
  done: [],
};

const Dashboard = () => {
  const [columns, setColumns] = useState(initialColumns);
  const navigate = useNavigate();

  useEffect(() => {
    // Removed the line that resets columns to initial state here to prevent setting it twice
    const token = localStorage.getItem("token");
    axios
      .get("http://127.0.0.1:5000/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('Tasks before setting state:', response.data);
        const fetchedTasks = response.data;
        const newColumns = { ...initialColumns }; // Starts from a clean slate every time
        fetchedTasks.forEach((task) => {
          newColumns[task.status.toLowerCase()].push(task);
        });
        setColumns(newColumns); // Updates state once after processing all tasks
      })
      .catch((error) => {
        console.error("Failed to fetch tasks:", error);
      });
  }, []); // Keeping the empty dependency array to ensure this runs only once on component mount
  


  const handleTaskDelete = (deletedTaskId) => {
    setColumns((prevColumns) => {
      const updatedColumns = {...prevColumns};
      // Iterate over each column (status)
      Object.keys(updatedColumns).forEach(status => {
        // Filter out the deleted task
        updatedColumns[status] = updatedColumns[status].filter(task => task.id !== deletedTaskId);
      });
      return updatedColumns;
    });
  };

  const handleLogout = () => {
    setColumns(initialColumns); // Explicitly reset the columns state on logout
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleTaskAdded = (newTask) => {
    if (newTask.parent_id) return; // Ignore subtasks
  
    setColumns((prevColumns) => {
      const updatedColumns = { ...prevColumns };
      updatedColumns[newTask.status.toLowerCase()] = [
        ...updatedColumns[newTask.status.toLowerCase()],
        newTask,
      ];
      return updatedColumns;
    });
  };
  
  

  return (
    <div className="dashboard">
      <h1>Kanban Board</h1>
      <button onClick={handleLogout} className="logout-button">
        Logout <i className="fas fa-sign-out-alt"></i>{" "}
      </button>

      <TaskForm onTaskAdded={handleTaskAdded} />

      <div className="kanban-columns">
        {Object.entries(columns).map(([status, tasks]) => (
          <div key={status} className={`column ${status}`}>
            <h2>{status.charAt(0).toUpperCase() + status.slice(1)}</h2>
            {tasks.map((task) => (
              <Task key={task.id} task={task} onTaskDelete={handleTaskDelete} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
