import React, { useState, useEffect } from 'react';
import styles from './modules/AddTaskModal.module.css';
/*import ModalAddTaskButton from './buttons/ModalAddTaskButton';*/
import { useDispatch, useSelector } from 'react-redux';
//import { addTask } from './taskSlice';
import { selectCatagory } from '../catagories/catagorySlice';
import { fetchTasks } from './taskSlice';

function AddTaskModal({ toggleTaskModal }) {
    const dispatch = useDispatch();
    const catagories = useSelector(selectCatagory);

    //const [taskId, setTaskId] = useState('');
    const [taskName, setTaskName] = useState('');
    //const [taskCatagory, setTaskCatagory] = useState('');
    const [description, setDescription] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [urgency, setUrgency] = useState(3);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(null);
    const [energyLevel, setEnergyLevel] = useState('');
    const [locationType, setLocationType] = useState('');
    const [flexibility, setFlexibility] = useState('');
    const [isHabit, setIsHabit] = useState(false);

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log("Form Submitted!");
        if (!taskName.trim()) return;
        const category = catagories.find(cat => cat.id === selectedCategoryId);
        if (!category && selectedCategoryId) {
            console.error('Category not found');
        }

        // If no category is selected, instead of sending '', it sends null
        const categoryIdToSend =
            selectedCategoryId === '' || selectedCategoryId == null
                ? null
                : selectedCategoryId;
    
        
        // ADDED FOR BACKEND
        const newTask = {
            /*user_id: 1,*/
            name: taskName,
            description,
            /*catagory: taskCatagory,*/
            due_date: dateTime ? dateTime : null,
            status: 'Not Started',
            urgency: urgency,
            category_id: categoryIdToSend,
            estimated_duration_minutes: estimatedDurationMinutes,
            energy_level: energyLevel,
            location_type: locationType,
            flexibility: flexibility,
            is_habit: isHabit
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

            /*dispatch(addTask({
                //id: data.id,
                taskName: data.name,
                //taskCatagory: data.catagory,
                description: data.description,
                dateTime: data.due_date,
                urgency: data.urgency,
                category_id: data.category_id,
                categoryName: category.name,
                categoryColor: category.color
                //categoryName: category?.name ?? null,
                //categoryColor: category?.color ?? null
            }));*/
            dispatch(fetchTasks());

            toggleTaskModal();
            setTaskName('');
            /*setTaskCatagory('');*/
            setDescription('');
            setDateTime('');
            setUrgency(2);
            setSelectedCategoryId('');
            setEstimatedDurationMinutes(null);
            setEnergyLevel('');
            setLocationType('');
            setFlexibility('');
            setIsHabit(false);
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

    useEffect(() => {
        document.body.classList.add('activeModal');
        return () => {
            document.body.classList.remove('activeModal');
        }
    }, []);

    return (
        <form className={styles.taskForm} onSubmit={handleSubmit}>
            <h3 className={styles.newTaskTitle}>Add New Task</h3>
            <div>
                <label htmlFor="taskName">Task: </label>    {/* Task Input */}

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
                <label htmlFor='taskCatagory'>Category: </label>
                <select
                    id='taskCatagory'
                    value={selectedCategoryId}
                    //setTaskCatagory(e.target.value)
                    onChange={(e) => {
                        const value = e.target.value;
                        setSelectedCategoryId(value === '' ? '' : Number(value));
                    }}
                >
                    <option value='' disabled>-- Select Category --</option>
                    {catagories.map(catagory => (
                        <option key={catagory.id} value={catagory.id}>{catagory.name}</option>
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
            <div className={styles.formGroup}>
                <label htmlFor="urgency">Urgency</label>
                <select
                    id="urgency"
                    value={urgency}
                    onChange={(e) => setUrgency(Number(e.target.value))}
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
                    //onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
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
            <button className={styles.addButton} type='submit'>Add Task</button>
        </form>
    );
}

export default AddTaskModal;