import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTask, updateTaskStatus } from './taskSlice';
import { selectCatagory, fetchCategories } from '../catagories/catagorySlice';
import styles from './modules/UpcomingTasks.module.css';

import { useEffect } from 'react';
import { fetchTasks } from './taskSlice.js';

const UpcomingTasks = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTask);

  /*console.log('Fetched tasks from Redux', tasks);*/
  // Fetches Tasks from Database and loads into Redux everytime this component is loaded
  useEffect(() => {
    console.log('Running: dispatching fetchTasks');
    dispatch(fetchTasks());
  }, [dispatch]);

  /*console.log('Current tasks from Redux', tasks);*/
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  

  const categories = useSelector(selectCatagory);
  const [selectedCategory, setSelectedCategory] = useState('all');
  /*
  // THIS FETCHES CATEGORIES FROM THE TASKS
  const categoryNames = ['all', ...new Set(tasks
    .map(task => task.catagory)
    .filter(category => category != null)
  )];*/
  const categoryNames = ['all', ...categories.map(cat => cat.name)];
  /*
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.catagory === selectedCategory);*/
  const filteredTasks = selectedCategory === 'all'
    ? tasks
    : tasks.filter(task => task.category.name === selectedCategory);
  
  const sortedTasks = [...filteredTasks].sort((a, b) => 
    new Date(a.dateTime) - new Date(b.dateTime)
  );

  // Group tasks by status
  const tasksByStatus = {
    'Not Started': sortedTasks.filter(task => task.status === 'Not Started'),
    'In Progress': sortedTasks.filter(task => task.status === 'In Progress'),
    'Completed': sortedTasks.filter(task => task.status === 'Completed')
  };

  const formatCategory = (category) => {
    if (!category) return 'Uncategorized';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#E5E7EB';
  };

  const handleStatusChange = async (taskId, newStatus) => {
    /*dispatch(updateTaskStatus({ id: taskId, status: newStatus }));*/
    try {
      const response = await fetch(`http://localhost:4000/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) throw new Error('Failed to update status');
  
      const updatedTask = await response.json();
      dispatch(updateTaskStatus({ id: taskId, status: updatedTask.status }));
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Not Started':
        return styles.statusNotStarted;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Completed':
        return styles.statusCompleted;
      default:
        return styles.statusNotStarted;
    }
  };

  const renderTaskCard = (task) => (
    <div key={task.id} className={styles.taskCard}>
      <div className={styles.taskHeader}>
        <div>
          <h3 className={styles.taskTitle}>{task.name}</h3>
          <p className={styles.taskDescription}>{task.description}</p>
        </div>
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          className={`${styles.statusSelect} ${getStatusClass(task.status)}`}
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className={styles.taskFooter}>
        <span className={styles.dueDate}>
          Due: {new Date(task.dateTime).toLocaleDateString()}
        </span>
        <span 
          className={styles.categoryBadge}
          //getCategoryColor(task.catagory)
          style={{ backgroundColor: getCategoryColor(task.category?.name) }}
        >
          {task.category?.name || 'Uncategorized'}
        </span>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>📋</div>
      <p>No tasks found</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.categoryFilter}>
        <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categoryNames.map((category) => (
            <option key={category} value={category}>
              {formatCategory(category)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.statusColumns}>
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} className={styles.section}>
            <h2 className={styles.sectionTitle}>{status}</h2>
            <div className={styles.tasksGrid}>
              {tasks.length > 0 ? (
                tasks.map(renderTaskCard)
              ) : (
                renderEmptyState()
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;
