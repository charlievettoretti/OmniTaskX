import React, { useState } from 'react';
import styles from './modules/GroupModal.module.css';

function JoinGroupModal({ onClose }) {
    const [groupJoinKey, setGroupJoinKey] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupJoinKey.trim()) return;

        try {
            const response = await fetch('http://localhost:4000/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ join_key: groupJoinKey.trim().toUpperCase() })
            });

            if (!response.ok) throw new Error('Failed to join group');

            const data = await response.json();

            onClose();
        } catch (err) {
            console.error('Error joining group:', err);
        }

    };

    return (
        <div className={styles.modal}>
            <div className={styles.overlay}>
                <div className={styles.modalContent}>
                    <h1>Join Group</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor='groupJoinKey'>Group Join Key</label>
                            <input type='text' id='groupJoinKey' value={groupJoinKey} onChange={(e) => setGroupJoinKey(e.target.value)} />
                        </div>
                        <button type='submit'>Join Group</button>
                        <button onClick={onClose}>Cancel</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default JoinGroupModal;