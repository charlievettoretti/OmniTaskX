import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { renameGroup } from './groupSlice';
import styles from './modules/GroupNameEditor.module.css';
import EditIcon from '../../components/icons/EditIcon.svg';

function GroupNameEditor({ groupId, currentName, isOwner, onNameChanged }) {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(currentName);
    const [loading, setLoading] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setNewName(currentName);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewName(currentName);
    };

    const handleSave = async () => {
        if (!newName.trim() || newName.trim() === currentName) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            await dispatch(renameGroup({ groupId, name: newName.trim() })).unwrap();
            setIsEditing(false);
            if (onNameChanged) {
                onNameChanged(newName.trim());
            }
        } catch (error) {
            console.error('Failed to rename group:', error);
            alert(error.message || 'Failed to rename group. Please try again.');
            setNewName(currentName);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (!isOwner) {
        return <h2>{currentName}</h2>;
    }

    if (isEditing) {
        return (
            <div className={styles.editContainer}>
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className={styles.nameInput}
                    autoFocus
                    disabled={loading}
                />
                <div className={styles.editActions}>
                    <button
                        onClick={handleSave}
                        disabled={loading || !newName.trim() || newName.trim() === currentName}
                        className={styles.saveButton}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.displayContainer}>
            <h2>{currentName}</h2>
            <button
                onClick={handleEdit}
                className={styles.editButton}
                title="Edit group name"
            >
                <img src={EditIcon} alt='Edit Group Name' />
            </button>
        </div>
    );
}

export default GroupNameEditor; 