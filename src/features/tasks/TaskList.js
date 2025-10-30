import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTask, updateTaskStatus } from './taskSlice';
import { selectGroups } from '../groups/groupSlice';
import { selectCatagory } from '../catagories/catagorySlice';
import { fetchGroupTasks, fetchAllGroupTasks, selectGroupTasks, updateGroupTaskStatus } from '../groups/groupTasks/groupTasksSlice';
import styles from './modules/TaskList.module.css';
import Task from './Task';

const TaskList = () => {
    const dispatch = useDispatch();
    const tasks = useSelector(selectTask);
    const groups = useSelector(selectGroups);
    const categories = useSelector(selectCatagory);
    const groupTasks = useSelector(selectGroupTasks);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch group tasks when a group is selected
    useEffect(() => {
        if (selectedGroup === 'all') {
            dispatch(fetchAllGroupTasks());
        } else if (selectedGroup !== 'personal') {
            dispatch(fetchGroupTasks(selectedGroup));
        }
    }, [selectedGroup, dispatch]);

    // Convert numeric urgency to display string
    const getUrgencyDisplay = (urgency) => {
        if (typeof urgency === 'string') {
            return urgency;
        }
        // REMOVE ? 
        // Regular tasks use 1-5 scale
        if (urgency >= 1 && urgency <= 5) {
            switch (urgency) {
                case 1: return 'Very Low';
                case 2: return 'Low';
                case 3: return 'Medium';
                case 4: return 'High';
                case 5: return 'Critical';
                default: return 'Medium';
            }
        }
        
        // Group tasks use 1-4 scale
        if (urgency >= 1 && urgency <= 4) {
            switch (urgency) {
                case 1: return 'Low';
                case 2: return 'Medium';
                case 3: return 'High';
                case 4: return 'Critical';
                default: return 'Medium';
            }
        }
        
        return 'Medium';
    };

    // Combine regular tasks and group tasks
    const allTasks = useMemo(() => {
        let combinedTasks = [...tasks];
        
        // Add group tasks based on selection
        if (selectedGroup === 'all' && groupTasks.length > 0) {
            // Transform all group tasks to match the regular task structure
            const transformedGroupTasks = groupTasks.map(groupTask => ({
                id: `group-${groupTask.id}`, // Prefix to avoid ID conflicts
                name: groupTask.name,
                description: groupTask.description,
                dateTime: groupTask.due_date,
                urgency: groupTask.urgency,
                urgencyDisplay: getUrgencyDisplay(groupTask.urgency),
                status: groupTask.status || 'Not Started',
                category_id: null, // Group tasks don't have categories in the current structure
                category: null,
                group_id: groupTask.group_id,
                group_name: groupTask.group_name,
                isGroupTask: true,
                assigned_users: groupTask.assigned_users,
                created_by_username: groupTask.created_by_username
            }));
            combinedTasks = [...combinedTasks, ...transformedGroupTasks];
        } else if (selectedGroup !== 'all' && selectedGroup !== 'personal' && groupTasks.length > 0) {
            // Transform group tasks for specific group
            const transformedGroupTasks = groupTasks.map(groupTask => ({
                id: `group-${groupTask.id}`, // Prefix to avoid ID conflicts
                name: groupTask.name,
                description: groupTask.description,
                dateTime: groupTask.due_date,
                urgency: groupTask.urgency,
                urgencyDisplay: getUrgencyDisplay(groupTask.urgency),
                status: groupTask.status || 'Not Started',
                category_id: null, // Group tasks don't have categories in the current structure
                category: null,
                group_id: selectedGroup,
                group_name: groupTask.group_name,
                isGroupTask: true,
                assigned_users: groupTask.assigned_users,
                created_by_username: groupTask.created_by_username
            }));
            combinedTasks = [...combinedTasks, ...transformedGroupTasks];
        }
        
        return combinedTasks;
    }, [tasks, groupTasks, selectedGroup]);

    // Sort tasks by due date
    const sortedTasks = useMemo(() => {
        return [...allTasks].sort((a, b) => {
            const dateA = new Date(a.dateTime);
            const dateB = new Date(b.dateTime);
            return dateA - dateB;
        });
    }, [allTasks]);

    // Filter tasks based on selected filters
    const filteredTasks = useMemo(() => {
        return sortedTasks.filter(task => {
            const matchesCategory = selectedCategory === 'all' || 
                (task.category && task.category.id === parseInt(selectedCategory));
            const matchesGroup = selectedGroup === 'all' || 
                selectedGroup === 'personal' ||
                (task.group_id && task.group_id === parseInt(selectedGroup)) ||
                (!task.isGroupTask && selectedGroup === 'personal');
            const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return matchesCategory && matchesGroup && matchesSearch;
        });
    }, [sortedTasks, selectedCategory, selectedGroup, searchTerm]);

    // Separate completed and non-completed tasks
    const activeTasks = filteredTasks.filter(task => task.status !== 'Completed');
    const completedTasks = filteredTasks.filter(task => task.status === 'Completed');

    const handleStatusChange = async (taskId, newStatus) => {
        const taskIdString = String(taskId);
        
        if (taskIdString.startsWith('group-')) {
            // Handle group task status update
            const actualTaskId = taskIdString.replace('group-', '');
            try {
                const response = await fetch(`http://localhost:4000/group-tasks/${actualTaskId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ status: newStatus }),
                });

                if (!response.ok) throw new Error('Failed to update group task status');

                const updatedTask = await response.json();
                dispatch(updateGroupTaskStatus({ id: actualTaskId, status: updatedTask.status }));
            } catch (err) {
                console.error('Error updating group task status:', err);
            }
        } else {
            // Handle regular task status update
            try {
                const response = await fetch(`http://localhost:4000/tasks/${taskId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ status: newStatus }),
                });

                if (!response.ok) throw new Error('Failed to update task status');

                const updatedTask = await response.json();
                dispatch(updateTaskStatus({ 
                    id: taskId, 
                    status: updatedTask.status,
                    category_id: updatedTask.category_id,
                    category_name: updatedTask.category_name,
                    category_color: updatedTask.category_color
                }));
            } catch (err) {
                console.error('Error updating task status:', err);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Started':
                return '#ff6b6b';
            case 'In Progress':
                return '#4ecdc4';
            case 'Completed':
                return '#45b7d1';
            default:
                return '#95a5a6';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUrgencyColor = (urgency) => {
        const urgencyDisplay = typeof urgency === 'string' ? urgency : getUrgencyDisplay(urgency);
        
        switch (urgencyDisplay) {
            case 'Very Low':
                return '#95a5a6';
            case 'Low':
                return '#27ae60';
            case 'Medium':
                return '#f39c12';
            case 'High':
                return '#e74c3c';
            case 'Critical':
                return '#8e44ad';
            default:
                return '#95a5a6';
        }
    };

    const TaskItem = ({ task }) => (
        <div className={styles.taskItem}>
            <div className={styles.taskHeader}>
                <h3 className={styles.taskName}>
                    {task.name}
                    {task.isGroupTask && (
                        <span className={styles.groupTaskBadge}>
                            {task.group_name ? `${task.group_name} Task` : 'Group Task'}
                        </span>
                    )}
                </h3>
                <div className={styles.taskMeta}>
                    <span 
                        className={styles.urgencyBadge}
                        style={{ backgroundColor: getUrgencyColor(task.urgency) }}
                    >
                        {task.urgencyDisplay || getUrgencyDisplay(task.urgency)}
                    </span>
                    {task.category && (
                        <span 
                            className={styles.categoryBadge}
                            style={{ backgroundColor: task.category.color }}
                        >
                            {task.category.name}
                        </span>
                    )}
                </div>
            </div>
            
            {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
            )}
            
            {task.isGroupTask && task.assigned_users && task.assigned_users.length > 0 && (
                <div className={styles.assignedUsers}>
                    <strong>Assigned to:</strong> {task.assigned_users.join(', ')}
                </div>
            )}
            
            <div className={styles.taskFooter}>
                <div className={styles.taskDate}>
                    <strong>Due:</strong> {formatDate(task.dateTime)}
                </div>
                
                <div className={styles.statusSelector}>
                    <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={{ borderColor: getStatusColor(task.status) }}
                    >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>
            
            {task.isGroupTask && task.created_by_username && (
                <div className={styles.taskCreator}>
                    Created by: {task.created_by_username}
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.taskListContainer}>
            {/* Filters Section */}
            <div className={styles.filtersSection}>
                <h2>Task Filters</h2>
                
                <div className={styles.filterRow}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="categoryFilter">Category:</label>
                        <select
                            id="categoryFilter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="groupFilter">Group:</label>
                        <select
                            id="groupFilter"
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                        >
                            <option value="all">All Tasks (Personal + Groups)</option>
                            <option value="personal">Personal Tasks Only</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name} Tasks
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="searchFilter">Search:</label>
                        <input
                            id="searchFilter"
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Task />
            </div>

            {/* Active Tasks Section */}
            <div className={styles.tasksSection}>
                <h2>Active Tasks ({activeTasks.length})</h2>
                {activeTasks.length === 0 ? (
                    <p className={styles.noTasks}>No active tasks found.</p>
                ) : (
                    <div className={styles.taskGrid}>
                        {activeTasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Tasks Section */}
            {completedTasks.length > 0 && (
                <div className={styles.completedSection}>
                    <h2>Completed Tasks ({completedTasks.length})</h2>
                    <div className={styles.taskGrid}>
                        {completedTasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;
