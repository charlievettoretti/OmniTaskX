import React from 'react';
import styles from './modules/tasksByWeek.module.css';
import { useSelector } from 'react-redux';
import { selectTask } from './taskSlice';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TasksWeek() {
  const tasks = useSelector(selectTask);

  const tasksByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {});

  tasks.forEach(task => {
    const date = new Date(task.dateTime);

    const day = daysOfWeek[date.getDay()];
    
    if (!day) return;

    tasksByDay[day].push(task);
  });

  return (
    <div className={styles.weekGrid}>
        {daysOfWeek.map(day => (
            <div className={styles.dayColumn} key={day}>
                <div className={styles.dayHeader}>{day}</div>
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
  );
}

export default TasksWeek;

