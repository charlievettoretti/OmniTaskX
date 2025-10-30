import React, { useState } from 'react';
import styles from './modules/GroupMembersManager.module.css';

function GroupMembersManager({ groupId, members, currentUserId, isOwner, onMemberRemoved }) {
    const [removingMember, setRemovingMember] = useState(null);

    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
            return;
        }

        setRemovingMember(memberId);
        try {
            const response = await fetch(`http://localhost:4000/groups/${groupId}/members/${memberId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                // Notify parent component to refresh members
                if (onMemberRemoved) {
                    onMemberRemoved();
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member. Please try again.');
        } finally {
            setRemovingMember(null);
        }
    };

    if (!members || members.length === 0) {
        return <p>No members found.</p>;
    }

    return (
        <div className={styles.membersList}>
            {members.map(member => (
                <div key={member.id} className={styles.memberItem}>
                    <div className={styles.memberInfo}>
                        <span className={styles.memberName}>{member.username}</span>
                        <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                    {isOwner && member.id !== currentUserId && (
                        <button
                            onClick={() => handleRemoveMember(member.id, member.username)}
                            disabled={removingMember === member.id}
                            className={styles.removeButton}
                            title="Remove member"
                        >
                            {removingMember === member.id ? 'Removing...' : '×'}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default GroupMembersManager; 