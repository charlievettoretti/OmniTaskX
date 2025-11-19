import React from 'react';
import styles from './modules/SettingsPage.module.css'
import WeeklyView from '../components/WeeklyView';

function SettingsPage() {
    return (
        <div className={styles.settings}>
            {/*<h1>Settings</h1>*/}
            <WeeklyView />
        </div>
    );
}

export default SettingsPage;