import React, { useState } from 'react';
import styles from './modules/Task.module.css';

import AddTaskModal from './AddTaskModal';

import { useSelector } from 'react-redux';
import { selectTask } from './taskSlice';

import TasksWeek from './TasksWeek.js';
import TasksPerWeek from './TasksPerWeek.js';


function Task() {
    /* To-Do */
    /*
    const [tasks, setTasks] = useState([]);

    const addTask = (newTask) => {
        const task = {
            ...newTask,
            completed: false
        }
        setTasks([...tasks, task]);
    }
    */
    const tasks = useSelector(selectTask);
    /*
    const taskList = todos.map((todo, index) => {
        return <li key={index}>{todo.Urgency}</li>
    });*/

    /* MODAL */
    const [modal, setModal] = useState(false);

    const toggleModal = () => {
        setModal(!modal)
    
    }
    if (modal) {
        document.body.classList.add('activeModal');
    } else {
        document.body.classList.remove('activeModal');
    }
    
    return (
        <div className={styles.taskPage}>
            {/*<ModalButton 
            onClick={toggleModal} 
            className={styles.openModal}
    >New Note</ModalButton>*/}
            {/*<ul>{taskList}</ul>*/}

            <button onClick={toggleModal} className={styles.addTaskButton}>
                <a className="btn2"><span className="spn2">Add Task</span></a>
            </button>

            
            {modal && 
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={toggleModal}></div>
                    <div className={styles.modalContent}>
                        
                        <button onClick={toggleModal} className={styles.closeModal}>X</button>
                        <AddTaskModal toggleModal={toggleModal}></AddTaskModal>
                        
                    </div>
                </div>
            }
            
            {/*
            {modal &&       
                <AddTaskModal toggleModal={toggleModal}></AddTaskModal>        
            }
            */}


            
            {/*<div className={styles.taskGrid}>
                <TasksWeek />
                <TasksPerWeek />
            </div>*/}
            {/*
            <div className={styles.taskList}>
                <ul>
                    {tasks.map(task => (
                        <li key={task.id}>{task.name} - Urgency: {task.urgency} - {task.catagory}</li>
                    ))}
                </ul>
            </div>
            */}
        </div>
    );
}
/*
const ModalButton = () => {
    return (
      <StyledWrapper>
        <button>
          <a className="btn2"><span className="spn2">New Note</span></a>
        </button>
      </StyledWrapper>
    );
  }
  */
 
  export default Task;