import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editTask } from './taskSlice';
import { selectCatagory } from '../catagories/catagorySlice';
import styles from './modules/EditTaskModal.module.css';

const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

function EditTaskModal({ task, toggleEditTaskModal, onTaskUpdated }) {
    const dispatch = useDispatch();
    const categories = useSelector(selectCatagory);

    const [taskName, setTaskName] = useState(task.name);
    const [taskCategoryId, setTaskCategoryId] = useState(task.category_id);
    const [description, setDescription] = useState(task.description);
    const [dateTime, setDateTime] = useState(task.dateTime);
    const [urgency, setUrgency] = useState(task.urgency);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setTaskName(task.name);
        setTaskCategoryId(task.category_id);
        setDescription(task.description);
        setDateTime(task.dateTime);
        setUrgency(task.urgency);
    }, [task]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskName.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            console.log('Submitting task update...');
            const response = await fetch(`http://localhost:4000/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: taskName,
                    category_id: taskCategoryId,
                    description,
                    due_date: dateTime,
                    status: task.status,
                    urgency
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask = await response.json();
            console.log('Task updated successfully:', updatedTask);
            
            // Update Redux store
            dispatch(editTask(updatedTask));
            
            // Call the onTaskUpdated callback
            await onTaskUpdated();
            
            // The modal will be closed by the parent component
        } catch (error) {
            console.error('Error updating task:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.taskForm} onSubmit={handleSubmit}>
            <h3 className={styles.editTaskTitle}>Edit Task</h3>
            <div>
                <label htmlFor="taskName">Task: </label>
                <input 
                    id='taskName'
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    type='text'
                    placeholder="Enter task title"
                    className={styles.taskNameInput}
                />
            </div>
            <div>
                <label htmlFor='taskCategory'>Category: </label>
                <select
                    id='taskCategory'
                    value={taskCategoryId || ''}
                    onChange={(e) => setTaskCategoryId(Number(e.target.value))}
                >
                    <option value='' disabled>-- Select Category --</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="taskDesc">Description: </label>
                <textarea 
                    id='taskDesc'
                    rows="5" 
                    cols="30"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description"
                    className={styles.taskDescInput}
                />
            </div>
            <div>
                <label htmlFor="taskDate">Due Date:</label>
                <input
                    id='taskDate'
                    value={formatDateForInput(dateTime)}
                    onChange={(e) => setDateTime(e.target.value)}
                    type='datetime-local'
                />
            </div>
            {/*
            <div>
                <label htmlFor='taskLevel'>Urgency Level:</label>
                <div className={styles.urgencyLevels}>
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className={styles.urgencyOption}>
                            <input
                                type='radio'
                                id={`${level}`}
                                name='taskLevel'
                                value={level}
                                checked={urgency === level}
                                onChange={(e) => setUrgency(parseInt(e.target.value))}
                            />
                            <label htmlFor={`${level}`}>{level}</label>
                        </div>
                    ))}
                </div>
            </div>
            */}
            <div className={styles.formGroup}>
                <label htmlFor="urgency">Urgency</label>
                <select
                    id="urgency"
                    value={urgency}
                    onChange={(e) => setUrgency(Number(e.target.value))}
                    className={styles.select}
                >
                    <option value={1}>Very Low</option>
                    <option value={2}>Low</option>
                    <option value={3}>Medium</option>
                    <option value={4}>High</option>
                    <option value={5}>Critical</option>
                </select>
            </div>
            <button className={styles.updateButton} type='submit'>Update Task</button>
        </form>
    );
}

export default EditTaskModal; 