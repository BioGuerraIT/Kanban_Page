import React, { useState } from 'react';
import axios from 'axios';

const SubtaskForm = ({ depth = 0, onChange, onAddSubtask }) => {
  if (depth > 2) return null; // Limit depth to 3 levels

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <input
        type="text"
        placeholder="Subtask title"
        onChange={(e) => onChange(e, 'title')}
      />
      <input
        type="text"
        placeholder="Subtask description"
        onChange={(e) => onChange(e, 'description')}
      />
      <button type="button" onClick={onAddSubtask}>+ Add Sub(sub)task</button>
    </div>
  );
};

const TaskForm = ({ onTaskAdded }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    subtasks: [],
  });

  const handleTaskChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubtaskChange = (index, field, value) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[index][field] = value;
    setTask({ ...task, subtasks: updatedSubtasks });
  };

  const addSubtask = (depth, parentIndex = null) => {
    const newSubtask = { title: '', description: '', subtasks: [] };
    if (depth === 0) {
      setTask({ ...task, subtasks: [...task.subtasks, newSubtask] });
    } else {
      // Recursively add subtasks to the correct parent
      const updatedSubtasks = [...task.subtasks];
      let parent = updatedSubtasks[parentIndex];
      for (let i = 1; i < depth; i++) {
        parent = parent.subtasks[parent.subtasks.length - 1];
      }
      parent.subtasks.push(newSubtask);
      setTask({ ...task, subtasks: updatedSubtasks });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implement API call to create task with subtasks
    console.log(task);
    // Example: axios.post('/api/tasks', task)...
    onTaskAdded(task); // Callback to clear form or update UI
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        type="text"
        value={task.title}
        onChange={handleTaskChange}
        placeholder="Task title"
        required
      />
      <textarea
        name="description"
        value={task.description}
        onChange={handleTaskChange}
        placeholder="Task description"
        required
      />
      {task.subtasks.map((subtask, index) => (
        <SubtaskForm
          key={index}
          depth={0}
          onChange={(e, field) => handleSubtaskChange(index, field, e.target.value)}
          onAddSubtask={() => addSubtask(1, index)}
        />
      ))}
      <button type="button" onClick={() => addSubtask(0)}>+ Add Subtask</button>
      <button type="submit">Create Task</button>
    </form>
  );
};

export default TaskForm;
