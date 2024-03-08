import React, { useState } from 'react';
import '../styles/TaskForm.css';
import axios from 'axios';


const SubtaskForm = ({ depth = 0, subtask, onChange, onAddSubtask }) => {
  if (depth >= 3) return null; // Prevents adding beyond sub-subtasks

  return (
    <div className={`subtask-form depth-${depth}`}>
      <input
        type="text"
        placeholder="Subtask Title"
        value={subtask.title}
        onChange={(e) => onChange(e.target.value, 'title')}
      />
      <input
        type="text"
        placeholder="Subtask Description"
        value={subtask.description}
        onChange={(e) => onChange(e.target.value, 'description')}
      />
    </div>
  );
};

const TaskForm = ({ onTaskAdded }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    subtasks: [],
  });

  const handleTaskChange = (e, field) => {
    setTask({ ...task, [field]: e.target.value });
  };

  const handleSubtaskChange = (path, value, field) => {
    let subtasks = [...task.subtasks];
    let target = subtasks;
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        target[path[i]][field] = value;
      } else {
        target = target[path[i]].subtasks;
      }
    }
    setTask({ ...task, subtasks });
  };

  const addSubtask = (path) => {
    let subtasks = [...task.subtasks];
    let target = subtasks;
    for (let i = 0; i < path.length; i++) {
      target = target[path[i]].subtasks;
    }
    target.push({ title: '', description: '', subtasks: [] });
    setTask({ ...task, subtasks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/tasks', task, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      onTaskAdded(response.data); // Assuming this callback function resets the form or updates the parent state
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };
  
  const renderSubtasks = (subtasks, depth = 0, path = []) => {
    return subtasks.map((subtask, index) => (
      <SubtaskForm
        key={index}
        depth={depth}
        subtask={subtask}
        onChange={(value, field) => handleSubtaskChange([...path, index], value, field)}
        onAddSubtask={() => addSubtask([...path, index])}
      />
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        name="title"
        type="text"
        value={task.title}
        onChange={(e) => handleTaskChange(e, 'title')}
        placeholder="Task Title"
        required
      />
      <textarea
        name="description"
        value={task.description}
        onChange={(e) => handleTaskChange(e, 'description')}
        placeholder="Task Description"
        required
      />
      {renderSubtasks(task.subtasks)}
      <div className="buttons">
        <button type="button" className="add-subtask" onClick={() => addSubtask([])}>+ Add Subtask</button>
        <button type="submit" className="create-task">Create Task</button>
      </div>
    </form>
  );
};

export default TaskForm;
