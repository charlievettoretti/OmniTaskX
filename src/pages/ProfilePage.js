import React from 'react';
import styles from './modules/ProfilePage.module.css';
import ButtonBar from '../components/ButtonBar';

function ProfilePage() {
    return (
        <div className={styles.profile}>
            <h1 className={styles.title}>Profile:</h1>
            <ButtonBar />
        </div>
    );
}

export default ProfilePage;