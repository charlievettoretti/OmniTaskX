import React from 'react';
import styles from './modules/WeeklyPage.module.css';
import WeeklyView from '../components/WeeklyView';

function WeeklyPage() {
    return (
        <div className={styles.weekly}>
            <div className={styles.weeklyHeader}>
                <h1>Weekly Calendar</h1>
            </div>
            <WeeklyView />
        </div>
    );
}

export default WeeklyPage;