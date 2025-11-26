import React from 'react';
import styles from './modules/QuickAddMenu.module.css';


function QuickAddMenu({ open, onAddTask, onAddEvent, onAddCategory }) {

    return (
        <div className={styles.quickAddContainer}>
        
            <button className={styles.trigger}><span>Quick Add</span></button>

            {open && (
                <div className={styles.quickAddMenu}>
                    <button className={styles.menuButton} onClick={onAddTask}>
                        Add Task
                    </button>
                    <button className={styles.menuButton} onClick={onAddEvent}>
                        Add Event
                    </button>
                    <button className={styles.menuButton} onClick={onAddCategory}>
                        Add Category
                    </button>
                </div>
            )} 
        </div>
    );
}

export default QuickAddMenu;