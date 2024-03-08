import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'; // Ensure axios is imported for API calls

const Task = ({ task, onTaskDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      onTaskDelete(taskId); // Notify parent component to update UI
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="task-card">
      <div className="task-actions">
        <button onClick={() => deleteTask(task.id)} className="delete-task-btn">X</button>
        {/* Add Subtask Button will go here */}
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      {task.subtasks && task.subtasks.length > 0 && (
        <button onClick={toggleExpand}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      )}
      {isExpanded && (
        <div className="subtasks">
          {task.subtasks.map((subtask) => (
            <Task key={subtask.id} task={subtask} onTaskDelete={onTaskDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

Task.propTypes = {
  task: PropTypes.object.isRequired,
  onTaskDelete: PropTypes.func.isRequired, // Prop to handle task deletion in the parent component
};

export default Task;
