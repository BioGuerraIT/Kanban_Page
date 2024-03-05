import React from 'react';
import PropTypes from 'prop-types';

// Task component that can recursively render subtasks
const Task = ({ task }) => {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      {/* Render subtasks if present */}
      {task.subtasks && (
        <div className="subtasks">
          {task.subtasks.map((subtask) => (
            <Task key={subtask.id} task={subtask} />
          ))}
        </div>
      )}
    </div>
  );
};

Task.propTypes = {
  task: PropTypes.object.isRequired,
};

export default Task;
