import React from 'react';
import styles from './modules/SettingsPage.module.css'

function SettingsPage() {
    return (
        <div className={styles.settings}>
            <h1>Settings</h1>
            <p>Coming Soon:</p>
            <ul>
                <li>Let user pick what time their day starts/ends - weekly calendar view</li>
                <li>Let user pick theme</li>
            </ul>

        </div>
    );
}

export default SettingsPage;