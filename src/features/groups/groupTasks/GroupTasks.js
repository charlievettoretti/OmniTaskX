import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupTasks, selectGroupTasks } from './groupTasksSlice';
import styles from './modules/GroupTasks.module.css';
import { updateGroupTaskStatus } from './groupTasksSlice';

function GroupTasks({ groupId }) {
    const dispatch = useDispatch();
    const groupTasks = useSelector(selectGroupTasks);
    const loading = useSelector((state) => state.groupTasks.loading);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupTasks(groupId));
        }
    }, [dispatch, groupId]);

    const handleGroupTaskStatusChange = async (taskId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:4000/group-tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updatedTask = await response.json();
            dispatch(updateGroupTaskStatus({ id: taskId, status: updatedTask.status }));
        } catch (err) {
            console.error('Error updating group task status:', err);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading tasks...</div>;
    }

    if (!groupTasks || groupTasks.length === 0) {
        return <div className={styles.noTasks}>No tasks found for this group.</div>;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Started':
                return styles.notStarted;
            case 'In Progress':
                return styles.inProgress;
            case 'Completed':
                return styles.completed;
            default:
                return styles.notStarted;
        }
    };

    return (
        <div className={styles.groupTasksContainer}>
            <div className={styles.tasksList}>
                {groupTasks.map(task => (
                    <div key={task.id} className={styles.taskCard}>
                        <div className={styles.taskHeader}>
                            <h4 className={styles.taskName}>{task.name}</h4>
                            {/*<span className={`${styles.taskStatus} ${getStatusColor(task.status)}`}>
                                {task.status}
                            </span>*/}
                            <select
                                value={task.status}
                                onChange={(e) => handleGroupTaskStatusChange(task.id, e.target.value)}
                                className={`${styles.taskStatus} ${getStatusColor(task.status)}`}
                            >
                                <option value='Not Started'>Not Started</option>
                                <option value='In Progress'>In Progress</option>
                                <option value='Completed'>Completed</option>
                            </select>
                                
                        </div>
                        {task.description && (
                            <p className={styles.taskDescription}>{task.description}</p>
                        )}
                        <div className={styles.taskDetails}>
                            <span className={styles.taskDueDate}>
                                Due: {formatDate(task.due_date)}
                            </span>
                            <span className={styles.taskUrgency}>
                                Urgency: {task.urgency}
                            </span>
                        </div>
                        {task.assigned_users && task.assigned_users.length > 0 && (
                            <div className={styles.assignedUsers}>
                                <strong>Assigned to:</strong> {task.assigned_users.join(', ')}
                            </div>
                        )}
                        <div className={styles.taskCreator}>
                            Created by: {task.created_by_username}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GroupTasks; 