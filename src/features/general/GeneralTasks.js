import { useSelector, useDispatch } from 'react-redux';
import { selectTask, fetchTasks } from '../tasks/taskSlice';
import React, { useState, useMemo } from 'react';
import styles from './modules/GeneralTasks.module.css';
import EditTaskModal from '../tasks/EditTaskModal';
 



function GeneralTasks() {
    const dispatch = useDispatch();
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const tasks = useSelector(selectTask);

    const generalTasks = useMemo(
    () =>
        tasks.filter(task => {
        const hasNoDueDate = !task.dateTime; // null/undefined/empty
        const isFlexible =
            task.flexibility === 'day-flexible' ||
            task.flexibility === 'week-flexible';

        // General Tasks are:
        // - NOT habits
        // - and either no due date OR flexible
        //return !task.is_habit && (hasNoDueDate || isFlexible);
        return !task.is_habit && hasNoDueDate;
        }),
    [tasks]
    );

    const handleSchedule = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:4000/tasks/${taskId}/schedule`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to schedule task!')
            }

            const updatedTask = await response.json();
            console.log('Scheduled Task: ', updatedTask);

            await dispatch(fetchTasks());

        } catch (err) {
            console.error('Error Scheduling Task: ', err);
        }
    }

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setEditTaskModal(true);
    };
    
    const closeEditTaskModal = () => {
        setEditingTask(null);
        setEditTaskModal(false);
    };

    const handleTaskUpdated = async () => {
        // Fetch fresh tasks from the backend
        await dispatch(fetchTasks());
        // Close the modal
        closeEditTaskModal();
    };

      if (editTaskModal) {
        document.body.classList.add('activeModal');
      } else {
        document.body.classList.remove('activeModal');
      }

    return (
        <div>
            <h2 className={styles.sectionTitle}>General Tasks</h2>

            {generalTasks.length === 0 ? (
            <p className={styles.emptyState}>
                No general tasks yet. Add a task without a due date or mark it as flexible
                to see it here.
            </p>
            ) : (
            <div className={styles.generalTasksGrid}>
                {generalTasks.map(task => (
                <div key={task.id} className={styles.generalTaskCard}>
                    <div className={styles.generalTaskHeader}>
                    <h3>{task.name}</h3>
                    {task.category && (
                        <span
                        className={styles.categoryPill}
                        style={{ backgroundColor: task.category.color }}
                        >
                        {task.category.name}
                        </span>
                    )}
                    </div>

                    {task.description && (
                    <p className={styles.generalTaskDescription}>
                        {task.description}
                    </p>
                    )}

                    <div className={styles.generalTaskMetaRow}>
                    {task.estimated_duration_minutes && (
                        <span className={styles.metaChip}>
                        ⏱ {task.estimated_duration_minutes} min
                        </span>
                    )}

                    {task.energy_level && (
                        <span className={styles.metaChip}>
                        ⚡ {task.energy_level}
                        </span>
                    )}

                    {task.flexibility && (
                        <span className={styles.metaChip}>
                        📆 {task.flexibility === 'day-flexible'
                            ? 'Anytime today'
                            : 'Anytime this week'}
                        </span>
                    )}

                    {task.location_type && (
                        <span className={styles.metaChip}>
                        📍 {task.location_type}
                        </span>
                    )}
                    </div>

                    <div className={styles.generalTaskFooter}>
                    <button
                        className={styles.smallButton}
                        onClick={() => {openEditTaskModal(task)}}
                    >
                        Edit
                    </button>
                    {editTaskModal && editingTask && (
                        <div className={styles.modal}>
                            <div className={styles.overlay} onClick={closeEditTaskModal}></div>
                            <div className={styles.modalContent}>
                            <button onClick={closeEditTaskModal} className={styles.closeModal}>X</button>
                            <EditTaskModal 
                                task={editingTask} 
                                toggleEditTaskModal={closeEditTaskModal}
                                onTaskUpdated={handleTaskUpdated}
                            />
                            </div>
                        </div>
                    )}

                    <div className="scheduleButtonContainer">
                        <button onClick={() => handleSchedule(task.id)}>Schedule</button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
    );
}

export default GeneralTasks;