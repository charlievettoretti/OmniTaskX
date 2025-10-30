import React from 'react';
import styles from './modules/Dashboard.module.css';
import UpcomingTasks from '../features/tasks/UpcomingTasks';

function Dashboard() {
    return (
        <div className={styles.dashboard}>
            <h1>Dashboard:</h1>
            <UpcomingTasks />
        </div>
    );
}


export default Dashboard;