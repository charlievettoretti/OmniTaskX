import React, { useState, useEffect } from 'react';
import styles from './modules/GroupPage.module.css';
import CreateGroupModal from '../features/groups/CreateGroupModal';
import JoinGroupModal from '../features/groups/JoinGroupModal';
import GroupTasks from '../features/groups/groupTasks/GroupTasks';
import AddGroupTaskButton from '../features/groups/groupTasks/AddGroupTaskButton';
import GroupNameEditor from '../features/groups/GroupNameEditor';
import GroupMembersManager from '../features/groups/GroupMembersManager';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups, selectGroups } from '../features/groups/groupSlice';
import CrownIcon from '../components/icons/crown.svg';
import { checkAuth } from '../features/auth/authSlice';


function GroupPage() {
    const dispatch = useDispatch();
    const groups = useSelector(selectGroups);

    const currentUserId = useSelector((state) => state.auth?.user?.id);

    const [createGroupModal, setCreateGroupModal] = useState(false);
    const [joinGroupModal, setJoinGroupModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const result = await dispatch(checkAuth());
            if (result.meta.requestStatus === 'fulfilled') {
                dispatch(fetchGroups());
            }
        };
        loadData();
    }, [dispatch]);

    const fetchGroupMembers = async (groupId) => {
        setLoadingMembers(true);
        try {
            const response = await fetch(`http://localhost:4000/groups/${groupId}/members`, {
                credentials: 'include',
            });
            if (response.ok) {
                const members = await response.json();
                setGroupMembers(members);
            } else {
                console.error('Failed to fetch group members');
                setGroupMembers([]);
            }
        } catch (error) {
            console.error('Error fetching group members:', error);
            setGroupMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleGroupClick = async (group) => {
        setSelectedGroup(group);
        await fetchGroupMembers(group.id);
    };

    const handleTaskAdded = () => {
        // Refresh group tasks when a new task is added
        if (selectedGroup) {
            // The GroupTasks component will automatically refresh due to the useEffect
        }
    };

    const handleBackToGroups = () => {
        setSelectedGroup(null);
        setGroupMembers([]);
    };

    const handleGroupNameChanged = (newName) => {
        // Update the selected group name in local state
        setSelectedGroup(prev => prev ? { ...prev, name: newName } : null);
    };

    const handleMemberRemoved = () => {
        // Refresh the members list
        if (selectedGroup) {
            fetchGroupMembers(selectedGroup.id);
        }
    };

    const isOwner = selectedGroup && selectedGroup.owner_id === currentUserId;

    return (
        <div className={styles.group}>

            <div className={styles.groupButtons}>
                <button onClick={() => setCreateGroupModal(true)} className={styles.createGroupButton}>Create Group</button>
                <button onClick={() => setJoinGroupModal(true)} className={styles.joinGroupButton}>Join Group</button>
            </div>
            { createGroupModal && (
                <CreateGroupModal open={CreateGroupModal} onClose={() => setCreateGroupModal(false)} />
            )}
            { joinGroupModal && (
                <JoinGroupModal open={JoinGroupModal} onClose={() => setJoinGroupModal(false)} />
            )}
            
            {!selectedGroup ? (
                <div className={styles.groupContent}>
                    <div className={styles.groupListContainer}>
                        <h2>My Groups:</h2>
                        <ul className={styles.groupList}>
                            {groups.map(group => (
                                <li 
                                    key={group.id} 
                                    className={styles.groupItem}
                                    onClick={() => handleGroupClick(group)}
                                >
                                    {group.owner_id === currentUserId && (
                                        <img src={CrownIcon} alt='Crown' className={styles.crownIcon} />
                                    )}
                                    <strong>{group.name}</strong>
                                </li>
                            ))}
                        </ul>   
                    </div>   
                </div>
            ) : (
                <div className={styles.groupDetailsContainer}>
                    <div className={styles.groupDetailsHeader}>
                        {/*<button onClick={handleBackToGroups} className={styles.backButton}>
                            ← Back to Groups
                        </button>*/}
                        <GroupNameEditor
                            groupId={selectedGroup.id}
                            currentName={selectedGroup.name}
                            isOwner={isOwner}
                            onNameChanged={handleGroupNameChanged}
                        />
                        {isOwner && (
                            <div className={styles.ownerBadge}>
                                <img src={CrownIcon} alt='Crown' className={styles.crownIcon} />
                                <span>Owner</span>
                            </div>
                        )}
                        {selectedGroup.join_key && (
                            <span className={styles.joinKey}>
                                Join Key: {selectedGroup.join_key}
                            </span>
                        ) }
                        <button onClick={handleBackToGroups} className={styles.backButton}>
                            Back to Groups →
                        </button>
                    </div>

                    <div className={styles.groupDetailsContent}>
                        <div className={styles.membersSection}>
                            <h3>Group Members</h3>
                            {loadingMembers ? (
                                <p>Loading members...</p>
                            ) : (
                                <GroupMembersManager
                                    groupId={selectedGroup.id}
                                    members={groupMembers}
                                    currentUserId={currentUserId}
                                    isOwner={isOwner}
                                    onMemberRemoved={handleMemberRemoved}
                                />
                            )}
                        </div>

                        <div className={styles.tasksSection}>
                            <div className={styles.tasksHeader}>
                                <h3>Group Tasks</h3>
                                <AddGroupTaskButton 
                                    group_id={selectedGroup.id} 
                                    members={groupMembers}
                                    onTaskAdded={handleTaskAdded}
                                />
                            </div>
                            <GroupTasks groupId={selectedGroup.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupPage;