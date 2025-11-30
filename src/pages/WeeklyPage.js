import React from 'react';
import styles from './modules/WeeklyPage.module.css';
import WeeklyView from '../components/WeeklyView';

function WeeklyPage() {
    return (
        <div className={styles.weekly}>
            <WeeklyView />
        </div>
    );
}

export default WeeklyPage;