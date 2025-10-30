import React from 'react';
import styles from './modules/CalendarPage.module.css'
import TasksPlusEvents from '../components/TasksPlusEvents';

function CalendarPage() {
    return (
        <div className={styles.calendar}>
            <h1>Calendar</h1>
            <TasksPlusEvents />
        </div>
    );
}

export default CalendarPage;