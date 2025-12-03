import React from 'react';
import styles from './modules/LoginPage.module.css';
import LoginForm from '../features/auth/LoginForm.js';

function LoginPage() {
    return (
        <div className={styles.login}>
            <LoginForm />
        </div>
    );
};

export default LoginPage;