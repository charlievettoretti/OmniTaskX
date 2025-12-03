import React from 'react';
import styles from './modules/CalendarPage.module.css'
import TasksPlusEvents from '../components/TasksPlusEvents';

function CalendarPage() {
    return (
        <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
                <h1>Calendar</h1>
            </div>
            <TasksPlusEvents />
        </div>
    );
}

export default CalendarPage;