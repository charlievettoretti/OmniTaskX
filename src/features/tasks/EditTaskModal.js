import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editTask } from './taskSlice';
import { selectCatagory } from '../catagories/catagorySlice';
import styles from './modules/EditTaskModal.module.css';


const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
  
    const d = new Date(dateStr);
  
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

function EditTaskModal({ task, toggleEditTaskModal, onTaskUpdated }) {
    const dispatch = useDispatch();
    const categories = useSelector(selectCatagory);

    const [taskName, setTaskName] = useState(task.name);
    const [taskCategoryId, setTaskCategoryId] = useState(task.category_id);
    const [description, setDescription] = useState(task.description);
    const [dateTime, setDateTime] = useState(formatDateForInput(task.dateTime));
    const [urgency, setUrgency] = useState(task.urgency);

    const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(task.estimated_duration_minutes);
    const [energyLevel, setEnergyLevel] = useState(task.energy_level);
    const [locationType, setLocationType] = useState(task.location_type);
    const [flexibility, setFlexibility] = useState(task.flexibility);
    const [isHabit, setIsHabit] = useState(task.is_habit);

    const [isSubmitting, setIsSubmitting] = useState(false);

    //console.log("EditTaskModal RECEIVED TASK:", task);

    useEffect(() => {
        setTaskName(task.name);
        setTaskCategoryId(task.category_id);
        setDescription(task.description);
        setDateTime(formatDateForInput(task.dateTime));
        setUrgency(task.urgency);
        setEstimatedDurationMinutes(task.estimated_duration_minutes);
        setEnergyLevel(task.energy_level);
        setLocationType(task.location_type);
        setFlexibility(task.flexibility);
        setIsHabit(task.is_habit);
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
                    //due_date: formattedDateTime,
                    status: task.status,
                    urgency,
                    estimated_duration_minutes: estimatedDurationMinutes,
                    energy_level: energyLevel,
                    location_type: locationType,
                    flexibility,
                    is_habit: isHabit
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask = await response.json();
            //console.log('Task updated successfully:', updatedTask);
            
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
                    value={dateTime}
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
            <div>
                <label htmlFor="estimated_duration_minutes">Estimated Duration (minutes)</label>
                <input
                    id='estimated_duration_minutes'
                    value={estimatedDurationMinutes || ''}
                    onChange={(e) => setEstimatedDurationMinutes(e.target.value ? Number(e.target.value) : null)}
                    onWheel={(e) => e.target.blur()}
                    type='number'
                />
            </div>
            <div>
                <label htmlFor="energy_level">Energy Level: </label>
                <select
                id="energy_level"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                
                >
                    <option value="">Select</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div>
                <label htmlFor="location_type">Location Type: </label>
                <select
                id="location_type"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                >
                    <option value="">Select</option>
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="anywhere">Anywhere</option>
                </select>
            </div>
            <div>
                <label htmlFor="flexibility">Flexibility: </label>
                <select
                id="flexibility"
                value={flexibility}
                onChange={(e) => setFlexibility(e.target.value)}
                >
                    <option value="">Select</option>
                    <option value="day-flexible">Any time this day</option>
                    <option value="week-flexible">Any time this week</option>
                </select>
            </div>
            <div>
                <label htmlFor="habit">
                    <input
                    id="habit"
                    type="checkbox"
                    checked={isHabit}
                    onChange={(e) => setIsHabit(e.target.checked)}
                     />
                      -- This is a habit:
                </label>
            </div>
            <button className={styles.updateButton} type='submit'>Update Task</button>
        </form>
    );
}

export default EditTaskModal; 