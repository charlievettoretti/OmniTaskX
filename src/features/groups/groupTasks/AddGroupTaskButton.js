import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addGroupTask } from './groupTasksSlice';
import styles from './modules/AddGroupTaskButton.module.css';

function AddGroupTaskButton({ group_id, members, onTaskAdded }) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [urgency, setUrgency] = useState('Medium');
    const [assignedUserIds, setAssignedUserIds] = useState([]);
    const [loading, setLoading] = useState(false);

    const urgencyMap = {
        Low: 1,
        Medium: 2,
        High: 3,
        Critical: 4
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const taskData = {
                name,
                description,
                due_date: dueDate,
                urgency: urgencyMap[urgency],
                assigned_user_ids: assignedUserIds
            };

            await dispatch(addGroupTask({ group_id, taskData })).unwrap();
            
            // Reset form
            setName('');
            setDescription('');
            setDueDate('');
            setUrgency('Medium');
            setAssignedUserIds([]);
            setOpen(false);
            
            // Notify parent component
            if (onTaskAdded) {
                onTaskAdded();
            }
        } catch (error) {
            console.error('Failed to add task:', error);
            alert('Failed to add task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = (userId) => {
        setAssignedUserIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleClose = () => {
        setOpen(false);
        // Reset form
        setName('');
        setDescription('');
        setDueDate('');
        setUrgency('Medium');
        setAssignedUserIds([]);
    };

    return (
        <>
            <button 
                onClick={() => setOpen(true)} 
                className={styles.addTaskButton}
            >
                Add Task
            </button>

            {open && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Task</h2>
                            <button onClick={handleClose} className={styles.closeButton}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="taskName">Task Name *</label>
                                <input
                                    type="text"
                                    id="taskName"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="taskDescription">Description</label>
                                <textarea
                                    id="taskDescription"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    className={styles.textarea}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="dueDate">Due Date</label>
                                    <input
                                        type="date"
                                        id="dueDate"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="urgency">Urgency</label>
                                    <select
                                        id="urgency"
                                        value={urgency}
                                        onChange={(e) => setUrgency(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value={1}>Low</option>
                                        <option value={2}>Medium</option>
                                        <option value={3}>High</option>
                                        <option value={4}>Critical</option>
                                    </select>
                                </div>
                            </div>

                            {members && members.length > 0 && (
                                <div className={styles.formGroup}>
                                    <label>Assign to Members</label>
                                    <div className={styles.membersList}>
                                        {members.map(member => (
                                            <label key={member.id} className={styles.memberCheckbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={assignedUserIds.includes(member.id)}
                                                    onChange={() => handleUserToggle(member.id)}
                                                />
                                                <span>{member.username}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.formActions}>
                                <button 
                                    type="button" 
                                    onClick={handleClose}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading || !name.trim()}
                                    className={styles.submitButton}
                                >
                                    {loading ? 'Adding...' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default AddGroupTaskButton;