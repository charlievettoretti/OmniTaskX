import React, { useState } from 'react';
import styles from './modules/ButtonBar.module.css';
//import ModalButton from './ui/ModalButton';
import styled from 'styled-components';
import AddTask from './ui/AddTask';

function ButtonBar() {
    /* To-Do */
    const [todos, setTodos] = useState([]);

    const addTodo = (newTodo) => {
        const todo = {
            ...newTodo,
            completed: false
        }
        setTodos([...todos, todo]);
    }
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
        <div>
            {/*<ModalButton 
            onClick={toggleModal} 
            className={styles.openModal}
    >New Note</ModalButton>*/}
            {/*<ul>{taskList}</ul>*/}
            <StyledWrapper>
                <button onClick={toggleModal}>
                    <a className="btn2"><span className="spn2">New Note</span></a>
                </button>
            </StyledWrapper>
    
            {modal && 
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={toggleModal}></div>
                    <div className={styles.modalContent}>
                        
                        <button onClick={toggleModal} className={styles.closeModal}>X</button>
                        <AddTask addTodo={addTodo} toggleModal={toggleModal}></AddTask>
                        
                    </div>
                </div>
            }
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
  const StyledWrapper = styled.div`
    .btn2 {
      position: relative;
      display: inline-block;
      padding: 15px 30px;
      border: 2px solid #fefefe;
      text-transform: uppercase;
      color: #fefefe;
      text-decoration: none;
      font-weight: 600;
      font-size: 20px;
      transition: 0.3s;
    }
  
    .btn2::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      width: calc(100% + 4px);
      height: calc(100% - -2px);
      background-color: #212121;
      transition: 0.3s ease-out;
      transform: scaleY(1);
    }
  
    .btn2::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      width: calc(100% + 4px);
      height: calc(100% - 50px);
      background-color: #212121;
      transition: 0.3s ease-out;
      transform: scaleY(1);
    }
  
    .btn2:hover::before {
      transform: translateY(-25px);
      height: 0;
    }
  
    .btn2:hover::after {
      transform: scaleX(0);
      transition-delay: 0.15s;
    }
  
    .btn2:hover {
      border: 2px solid #fefefe;
      cursor: pointer;
    }

    .btn2:active {
      background-color: #fefefe;
      transition: 0.3s ease-out;
    }
  
    .btn2 span {
      position: relative;

    }
  
    button {
      text-decoration: none;
      border: none;
      background-color: transparent;
    }`;






export default ButtonBar;