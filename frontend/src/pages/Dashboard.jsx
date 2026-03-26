import React, { useEffect, useState } from 'react';
import { taskApi } from '../api/axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  
  const [taskData, setTaskData] = useState({ title: '', description: '', is_completed: false });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskApi.getAll();
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // --- CREATE OR UPDATE LOGIC ---
  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await taskApi.update(currentTaskId, taskData);
      } else {
        await taskApi.create(taskData);
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      alert("Action failed: Check permissions or server status.");
    }
  };

  // --- OPEN MODAL FOR EDIT ---
  const openEditModal = (task) => {
    setIsEditMode(true);
    setCurrentTaskId(task.id);
    setTaskData({ title: task.title, description: task.description, is_completed: task.is_completed });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setTaskData({ title: '', description: '', is_completed: false });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      try {
        await taskApi.delete(id);
        fetchTasks();
      } catch (err) { alert("Unauthorized"); }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">My Tasks</h2>
        <button className="btn btn-primary px-4 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>Create Task
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Status</th>
                <th>Task Info</th>
                <th>Owner</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <span className={`badge ${task.is_completed ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {task.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className={task.is_completed ? 'text-decoration-line-through text-muted' : 'fw-bold text-dark'}>
                      {task.title}
                    </div>
                    <small className="text-muted">{task.description}</small>
                  </td>
                  <td><small className="text-secondary">@{task.owner_username}</small></td>
                  <td className="text-end">
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => openEditModal(task)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(task.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FOR ADD/EDIT */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className={`modal-header ${isEditMode ? 'bg-info' : 'bg-primary'} text-white`}>
                <h5 className="modal-title">{isEditMode ? 'Edit Task' : 'New Task'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSaveTask}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Title</label>
                    <input 
                      type="text" className="form-control" required 
                      value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Description</label>
                    <textarea 
                      className="form-control" rows="3"
                      value={taskData.description} onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="form-check form-switch mt-3">
                    <input 
                      className="form-check-input" type="checkbox" 
                      checked={taskData.is_completed} 
                      onChange={(e) => setTaskData({...taskData, is_completed: e.target.checked})}
                    />
                    <label className="form-check-label">Mark as Completed</label>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                  <button type="submit" className={`btn ${isEditMode ? 'btn-info' : 'btn-primary'} px-4`}>
                    {isEditMode ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;