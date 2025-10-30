import React, { useState } from 'react';
import styles from './modules/AddTask.module.css';
import ModalAddTaskButton from './buttons/ModalAddTaskButton';

function AddTask({ addTodo, toggleModal }) {
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [urgency, setUrgency] = useState(3);

    const handleSubmit = (e) => {
        e.preventDefault();
        //console.log("Form Submitted!");
        if (!taskName.trim()) return;
        
        //console.log("Adding task:", { taskName, description, dateTime, urgency });

        addTodo({
            Task: taskName,
            Description: description,
            DateTime: dateTime,
            Urgency: urgency
        });
        toggleModal();
        setTaskName('');
        setDescription('');
        setDateTime('');
        setUrgency('');
    }
    return (
        <form className={styles.taskForm} onSubmit={handleSubmit}>
            <h3 className={styles.newTaskTitle}>Add New Task</h3>
            <div>
                <label htmlFor="taskName">Task: </label>    {/* Task Input */}
                <br />
                <input 
                id='taskName'
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                type='text'
                placeholder="Enter task title"
                className={styles.taskNameInput}></input>
                <br />
            </div>
            <div>
                <label htmlFor="taskDesc">Description: </label>
                <br />
                <textarea id='taskDesc'
                rows="5" 
                cols="30"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                className={styles.taskDescInput}></textarea>
                <br />
            </div>
            <div>
                <label htmlFor="taskDate">Date and Time:</label>
                <br />
                <input
                id='taskDate'
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                type='datetime-local'></input>
                <br />
            </div>
            <div>
                <label htmlFor='taskLevel'>Urgency Level:</label>
                <br />
                <input
                type='radio'
                id='1'
                name='taskLevel'
                value='1'
                onChange={(e) => setUrgency(e.target.value)} />
                <label htmlFor='1'>1</label> <br />
                <input
                type='radio'
                id='2'
                name='taskLevel'
                value='2'
                onChange={(e) => setUrgency(e.target.value)} />
                <label htmlFor='2'>2</label> <br />
                <input
                type='radio'
                name='taskLevel'
                id='3'
                value='3'
                onChange={(e) => setUrgency(e.target.value)} />
                <label htmlFor='3'>3</label> <br />
                <input
                type='radio'
                name='taskLevel'
                id='4'
                value='4'
                onChange={(e) => setUrgency(e.target.value)} />
                <label htmlFor='4'>4</label> <br />
                <input
                type='radio'
                name='taskLevel'
                id='5'
                value='5'
                onChange={(e) => setUrgency(e.target.value)} />
                <label htmlFor='5'>5</label>
                <button className={styles.addButton} type='submit'>Add Task</button>
            </div>
        </form>
    );
}

export default AddTask;