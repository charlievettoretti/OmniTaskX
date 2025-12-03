import React, { useState } from 'react';
import styles from './modules/ToDoPage.module.css'
import TaskList from '../features/tasks/TaskList.js';
import Catagories from '../features/catagories/Catagories.js';
import Events from '../features/events/Events.js';
import GeneralTasks from '../features/general/GeneralTasks.js';
import Catagory from '../features/catagories/Catagory.js';
import Event from '../features/events/Event.js';

function ToDoPage() {
    const [activeSection, setActiveSection] = useState('tasks'); // 'tasks', 'categories', 'events'

    return (
        <div className={styles.todo}>
            {/* Header Section */}
            <div className={styles.todoHeader}>
                <h1>Task Management</h1>
                <div className={styles.todoButtons}>
                    <button 
                        onClick={() => setActiveSection('tasks')} 
                        className={`${styles.sectionButton} ${activeSection === 'tasks' ? styles.active : ''}`}
                    >
                        Tasks
                    </button>
                    <button
                        onClick={() => setActiveSection('general')}
                        className={`${styles.sectionButton} ${activeSection === 'general' ? styles.active : ''}`}
                    >
                        General Tasks
                    </button>
                    <button 
                        onClick={() => setActiveSection('categories')} 
                        className={`${styles.sectionButton} ${activeSection === 'categories' ? styles.active : ''}`}
                    >
                        Categories
                    </button>
                    <button 
                        onClick={() => setActiveSection('events')} 
                        className={`${styles.sectionButton} ${activeSection === 'events' ? styles.active : ''}`}
                    >
                        Events
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className={styles.todoContent}>
                {activeSection === 'tasks' && (
                    <div className={styles.tasksSection}>
                        {/*
                        <div className={styles.sectionHeader}>
                            <h2>Task Management</h2>
                            <p>Create, organize, and track your tasks</p>
                        </div>
                        */}
                        
                        <div className={styles.tasksContent}>
                            <TaskList />
                        </div>
                    </div>
                )}
                {activeSection === 'general' && (
                    <div className={styles.generalSection}>
                        <div className={styles.sectionHeader}>
                            <h2>General Task Management</h2>
                            <div className={styles.generalContent}>
                                <GeneralTasks />
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'categories' && (
                    <div className={styles.categoriesSection}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h2>Category Management</h2>
                                <p>Organize your tasks with custom categories</p>
                            </div>
                            <Catagories />
                        </div>
                        
                        <div className={styles.categoriesContent}>
                            <Catagory />
                        </div>
                    </div>
                )}

                {activeSection === 'events' && (
                    <div className={styles.eventsSection}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h2>Event Management</h2>
                                <p>Schedule and manage your events</p>
                            </div>
                            <Events />
                        </div>
                        
                        <div className={styles.eventsContent}>
                            <Event />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ToDoPage;