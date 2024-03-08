import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios"; // Ensure axios is imported for API calls

const Task = ({ task, onTaskDelete, addSubSubtask }) => {
  const [isSubTaskExpanded, setSubTaskIsExpanded] = useState(false);

  const toggleExpandSubTask = () => setSubTaskIsExpanded(!isSubTaskExpanded);
  const toggleAddSubSubTask = () => console.log("hey");

  const deleteTask = async (task) => {
    try {
      if (
        task.subtasks &&
        task.subtasks.subtasks &&
        task.subtasks.subtasks.length > 0
      ) {
        for (const subtask of task.subtasks.subtasks) {
          await axios.delete(`http://127.0.0.1:5000/tasks/${subtask.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }
      }
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subtask of task.subtasks) {
          await axios.delete(`http://127.0.0.1:5000/tasks/${subtask.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        }
      }
      await axios.delete(`http://127.0.0.1:5000/tasks/${task.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      onTaskDelete(task.id); // Notify parent component to update UI
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="task-card">
      <div className="task-actions">
        <button onClick={() => deleteTask(task)} className="delete-task-btn">
          Delete Task
        </button>
        {addSubSubtask && (
          <button onClick={toggleAddSubSubTask}>Add Subsubtask</button>
        )}
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      {task.subtasks && (
        <>
          <button onClick={toggleExpandSubTask}>
            {isSubTaskExpanded ? "Collapse" : "Expand"}
          </button>
          {isSubTaskExpanded && (
            <div className="subtasks">
              {task.subtasks.map((subtask) => (
                <>
                  <Task
                    key={subtask.id}
                    task={subtask}
                    onTaskDelete={onTaskDelete}
                    addSubSubtask={true}
                  />
                  {subtask.subtasks &&
                    subtask.subtasks.map((subsubtask) => (
                      <Task
                        key={subsubtask.id}
                        task={subsubtask}
                        onTaskDelete={onTaskDelete}
                        addSubSubtask={false}
                      />
                    ))}
                </>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

Task.propTypes = {
  task: PropTypes.object.isRequired,
  onTaskDelete: PropTypes.func.isRequired, // Prop to handle task deletion in the parent component
  addSubSubTask: PropTypes.bool,
};

export default Task;
