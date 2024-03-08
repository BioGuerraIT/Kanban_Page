import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Task = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="task-card">
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
