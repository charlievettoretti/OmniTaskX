import React, { useState } from 'react';
import styles from './modules/GroupModal.module.css';

function CreateGroupModal({ onClose }) {
    const [groupName, setGroupName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return;

        try {
            const response = await fetch('http://localhost:4000/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name: groupName })
            });

            if (!response.ok) throw new Error('Failed to create group');

            const data = await response.json();

            onClose();
        } catch (err) {
            console.error('Error creating group:', err);
        }
    };

    return (
        <div className={styles.modal}>
            <div className={styles.overlay}>
                <div className={styles.modalContent}>
                    <h1>Create Group</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor='groupName'>Group Name</label>
                            <input type='text' id='groupName' value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                        </div>
                        <button type='submit'>Create Group</button>
                        <button onClick={onClose}>Cancel</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateGroupModal;