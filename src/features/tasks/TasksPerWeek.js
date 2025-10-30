import React, { useState } from 'react';
import styles from './modules/tasksByWeek.module.css';
import { useSelector } from 'react-redux';
import { selectTask } from './taskSlice';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TasksPerWeek() {
    const tasks = useSelector(selectTask);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    // Get the start of the week (Sunday)
    const getWeekStart = (date) => {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        return start;
    };

    // Get dates for the current week
    const getWeekDates = () => {
        const start = getWeekStart(currentWeek);
        return daysOfWeek.map((_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });
    };

    // Navigate to previous week
    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeek(newDate);
    };

    // Navigate to next week
    const goToNextWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeek(newDate);
    };

    // Format date as "Month Day"
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Format week range
    const formatWeekRange = () => {
        const start = getWeekStart(currentWeek);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const weekDates = getWeekDates();
    const tasksByDay = daysOfWeek.reduce((acc, day) => {
        acc[day] = [];
        return acc;
    }, {});

    tasks.forEach(task => {
        const taskDate = new Date(task.dateTime);
        const day = daysOfWeek[taskDate.getDay()];
        const weekStart = getWeekStart(currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Only show tasks for the current week
        if (taskDate >= weekStart && taskDate <= weekEnd) {
            tasksByDay[day].push(task);
        }
    });

    return (
        <div className={styles.weekContainer}>
            <div className={styles.weekNavigation}>
                <button className={styles.navButton} onClick={goToPreviousWeek}>
                    &lt;
                </button>
                <div className={styles.weekRange}>{formatWeekRange()}</div>
                <button className={styles.navButton} onClick={goToNextWeek}>
                    &gt;
                </button>
            </div>
            <div className={styles.weekGrid}>
                {daysOfWeek.map((day, index) => (
                    <div className={styles.dayColumn} key={day}>
                        <div className={styles.dayHeader}>
                            <div>{day}</div>
                            <div className={styles.date}>{formatDate(weekDates[index])}</div>
                        </div>
                        {tasksByDay[day].map(task => (
                            <div key={task.id} className={styles.taskItem}>
                                <strong>{task.name}</strong>
                                <br />
                                Urgency: {task.urgency}<br />
                                {new Date(task.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TasksPerWeek;