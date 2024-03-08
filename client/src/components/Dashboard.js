import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import Task from "./Task";

const initialColumns = {
  todo: [],
  inProgress: [],
  review: [],
  done: [],
};

const Dashboard = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
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
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://127.0.0.1:5000/tasks",
        {
          title: newTaskTitle,
          description: newTaskDescription,
          status: "todo", // Assuming new tasks default to 'todo'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const addedTask = response.data;
        setColumns((prevColumns) => ({
          ...prevColumns,
          todo: [...prevColumns.todo, addedTask],
        }));
        setNewTaskTitle("");
        setNewTaskDescription("");
      })
      .catch((error) => {
        console.error("Error adding task:", error);
      });
  };

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

  return (
    <div className="dashboard">
      <h1>Kanban Board</h1>
      <button onClick={handleLogout} className="logout-button">
        Logout <i className="fas fa-sign-out-alt"></i>{" "}
      </button>

      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Task Title"
          required
        />
        <textarea
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          placeholder="Task Description"
          required
        />
        <button type="submit" className="add-task-button">
          Add Task
        </button>
      </form>
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
