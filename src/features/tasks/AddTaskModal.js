import React, { useState } from 'react';
import styles from './modules/AddTaskModal.module.css';
/*import ModalAddTaskButton from './buttons/ModalAddTaskButton';*/
import { useDispatch, useSelector } from 'react-redux';
import { addTask } from './taskSlice';
import { selectCatagory } from '../catagories/catagorySlice';

function AddTaskModal({ toggleModal }) {
    const dispatch = useDispatch();
    const catagories = useSelector(selectCatagory);

    const [taskId, setTaskId] = useState('');
    const [taskName, setTaskName] = useState('');
    const [taskCatagory, setTaskCatagory] = useState('');
    const [description, setDescription] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [urgency, setUrgency] = useState(3);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log("Form Submitted!");
        if (!taskName.trim()) return;
        const category = catagories.find(cat => cat.id === selectedCategoryId);
        if (!category) {
            console.error('Category not found');
        }
        // ADDED FOR BACKEND
        const newTask = {
            /*user_id: 1,*/
            name: taskName,
            description,
            /*catagory: taskCatagory,*/
            due_date: dateTime ? dateTime : null,
            status: 'Not Started',
            urgency: urgency,
            category_id: selectedCategoryId
        };

        // ADDED FOR BACKEND
        try {
            const response = await fetch('http://localhost:4000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newTask),
            });
            if (!response.ok) throw new Error('Failed to create task');
            const data = await response.json();

            dispatch(addTask({
                /*id: data.id,*/
                taskName: data.name,
                /*taskCatagory: data.catagory,*/
                description: data.description,
                dateTime: data.due_date,
                urgency: data.urgency,
                category_id: data.category_id,
                categoryName: category.name,
                categoryColor: category.color
                //categoryName: category?.name ?? null,
                //categoryColor: category?.color ?? null
            }));
            toggleModal();
            setTaskName('');
            /*setTaskCatagory('');*/
            setDescription('');
            setDateTime('');
            setUrgency(2);
            setSelectedCategoryId('');
        } catch (err) {
            console.error("Failed to save task:", err);
        }
        /*
        // ORIGINAL (FOR FRONT END)
        dispatch(addTask({
            id: Date.now(),
            taskName,
            taskCatagory,
            description,
            dateTime,
            urgency
        }));
        toggleModal();
        setTaskName('');
        setTaskCatagory('');
        setDescription('');
        setDateTime('');
        setUrgency(3);
        */
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
                <label htmlFor='taskCatagory'>Category: </label>
                <br />
                <select
                    id='taskCatagory'
                    //taskCatagory
                    value={selectedCategoryId}
                    //setTaskCatagory(e.target.value)
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                >
                    <option value='' disabled>-- Select Category --</option>
                    {catagories.map(catagory => (
                        <option key={catagory.id} value={catagory.id}>{catagory.name}</option>
                        //key={category.color}
                    ))}

                </select>
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
                <label htmlFor="taskDate">Due Date:</label>
                <br />
                <input
                id='taskDate'
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                type='datetime-local'></input>
                <br />
            </div>
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
            {/*
            <div className={styles.radioGroup}>
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
            </div>*/}
            <br />
            <button className={styles.addButton} type='submit'>Add Task</button>
            
        </form>
    );
}

export default AddTaskModal;