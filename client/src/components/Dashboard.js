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
    setColumns(initialColumns); // Reset columns to initial state
    const token = localStorage.getItem("token");
    axios
      .get("http://127.0.0.1:5000/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const fetchedTasks = response.data;
        const newColumns = { ...initialColumns };
        fetchedTasks.forEach((task) => {
          newColumns[task.status.toLowerCase()].push(task);
        });
        setColumns(newColumns);
      })
      .catch((error) => {
        console.error("Failed to fetch tasks:", error);
      });
  }, []); //maybe remove the empty array


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
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleTaskAdded = (newTask) => {
    setColumns((prevColumns) => {
      // Clone the existing columns to avoid direct state mutation
      const updatedColumns = { ...prevColumns };
  
      // Assuming new tasks and their subtasks (if any) default to 'todo' status
      // For tasks with different statuses, you might need additional logic to place them correctly
      updatedColumns['todo'] = [...updatedColumns['todo'], newTask];
  
      // Recursively add subtasks (if the backend response includes them structured accordingly)
      const addSubtasks = (task) => {
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach((subtask) => {
            updatedColumns[subtask.status.toLowerCase()] = [...updatedColumns[subtask.status.toLowerCase()], subtask];
            addSubtasks(subtask); // Recursively add deeper levels of subtasks
          });
        }
      };
  
      // Call the recursive function for the newly added task
      addSubtasks(newTask);
  
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
