import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useSelector, useDispatch } from 'react-redux';
import { selectTask, updateTaskStatus, fetchTasks } from '../features/tasks/taskSlice';
import { selectEvent, updateEventStatus, fetchEvents } from '../features/events/eventSlice';
import { selectCatagory, fetchCategories } from '../features/catagories/catagorySlice';
import styles from './modules/TasksPlusEvents.module.css';
import 'react-calendar/dist/Calendar.css';
import EditTaskModal from '../features/tasks/EditTaskModal';
import EditEventModal from '../features/events/EditEventModal';
import EditIcon from './icons/EditIcon.svg';
import { useMemo } from 'react';

function TasksPlusEvents() {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editEventModal, setEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false); // For refreshing calendar after edits
  const tasks = useSelector(selectTask);
  const events = useSelector(selectEvent);
  const categories = useSelector(selectCatagory);

  // Add useEffect to fetch tasks when component mounts
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);
  
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Get unique categories from both tasks and events
  /*
  const allCategories = ['all', ...new Set([
    ...tasks.map(task => task.catagory).filter(Boolean),
    ...events.map(event => event.catagory).filter(Boolean)
  ])];*/
  const allCategories = ['all', ...categories.map(cat => cat.name)];

  const formatDate = (date) => {
    // Create a date object in the local timezone
    const localDate = new Date(date);
    // Format as YYYY-MM-DD in local timezone
    return localDate.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getItemsForDate = (date) => {
    const dateStr = formatDate(date);
    
    // Filter tasks by date, category, and type
    const dateTasks = tasks.filter(task => {
      const taskDate = new Date(task.dateTime);
      const matchesDate = formatDate(taskDate) === dateStr;
      const matchesCategory = selectedCategory === 'all' || task.category?.name === selectedCategory;
      const matchesType = selectedType === 'all' || selectedType === 'tasks';
      return matchesDate && matchesCategory && matchesType;
    });

    // Filter events by date, category, and type
    const dateEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      const matchesDate = formatDate(eventDate) === dateStr;
      const matchesCategory = selectedCategory === 'all' || event.category?.name === selectedCategory;
      const matchesType = selectedType === 'all' || selectedType === 'events';
      return matchesDate && matchesCategory && matchesType;
    });

    // Separate and sort tasks by status
    const activeTasks = dateTasks
      .filter(task => task.status !== 'Completed')
      .sort((a, b) => {
        const timeA = new Date(a.dateTime).getTime();
        const timeB = new Date(b.dateTime).getTime();
        return timeA - timeB;
      });

    const completedTasks = dateTasks
      .filter(task => task.status === 'Completed')
      .sort((a, b) => {
        const timeA = new Date(a.dateTime).getTime();
        const timeB = new Date(b.dateTime).getTime();
        return timeA - timeB;
      });

    const sortedEvents = [...dateEvents].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });

    return { 
      activeTasks, 
      completedTasks, 
      events: sortedEvents 
    };
  };
  /*
  const { activeTasks, completedTasks, events: selectedEvents } = getItemsForDate(selectedDate);*/
  const { activeTasks, completedTasks, events: selectedEvents } = useMemo(() => {
    const result = getItemsForDate(selectedDate);
    //console.log('Events for selected date:', result.events);
    //console.log('Tasks for selected date:', result.activeTasks, result.completedTasks);
    return result;
  }, [selectedDate, tasks, events, selectedCategory, selectedType, refreshFlag]);

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#E5E7EB';
  };

  const getEventCategoryColor = (event) => {
    return event.category?.color || '#E5E7EB';
  };

  const getTaskCategoryColor = (task) => {
    return task.category?.color || '#E5E7EB';
  };
  /*
  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };*/
  const formatTime = (dateTime) => {
    // Parse the datetime string as local time, not UTC
    const dateStr = dateTime.replace(' ', 'T'); // Convert "2025-11-18 09:00:00" to "2025-11-18T09:00:00"
    const date = new Date(dateStr);
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const { activeTasks, completedTasks, events } = getItemsForDate(date);
    const totalItems = activeTasks.length + completedTasks.length + events.length;
    
    if (totalItems === 0) return null;

    return (
      <div className={styles.tileContent}>
        {activeTasks.map((_, index) => (
          <div key={`active-${index}`} className={styles.taskDot} />
        ))}
        {completedTasks.map((_, index) => (
          <div key={`completed-${index}`} className={styles.completedDot} />
        ))}
        {events.map((_, index) => (
          <div key={`event-${index}`} className={styles.eventDot} />
        ))}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const { activeTasks, completedTasks, events } = getItemsForDate(date);
    return (activeTasks.length + completedTasks.length + events.length) > 0 ? styles.hasItems : null;
  };

  /*const { activeTasks, completedTasks, events: selectedEvents } = getItemsForDate(selectedDate);*/

  const handleStatusChange = async(taskId, newStatus) => {
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
  };

  const handleEventStatusChange = async(eventId, newStatus) => {
    //console.log('eventId:', eventId, 'newStatus:', newStatus);
    try {
      const response = await fetch(`http://localhost:4000/events/${eventId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus}),
      });
      if (!response.ok) throw new Error('Failed to update status');

      const updatedEvent = await response.json();
      dispatch(updateEventStatus({ 
        id: eventId, 
        status: updatedEvent.status,
        category_id: updatedEvent.category_id,
        category_name: updatedEvent.category_name,
        category_color: updatedEvent.category_color
      }));
    } catch (err) {
      console.error('Error updating error status:', err);
    }
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setEditTaskModal(true);
  };

  const closeEditTaskModal = () => {
    setEditingTask(null);
    setEditTaskModal(false);
    setRefreshFlag(prev => !prev); // for Refreshing
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEditEventModal(true);
  };

  const closeEditEventModal = () => {
    setEditingEvent(null);
    setEditEventModal(false);
    setRefreshFlag(prev => !prev); // for Refreshing
  };

  const handleTaskUpdated = async () => {
    // Fetch fresh tasks from the backend
    await dispatch(fetchTasks());
    // Close the modal
    closeEditTaskModal();
  };

  const handleEventUpdated = async () => {
    // Fetch fresh events from the backend
    await dispatch(fetchEvents());
    // Close the modal
    closeEditEventModal();
  };

  if (editTaskModal || editEventModal) {
    document.body.classList.add('activeModal');
  } else {
    document.body.classList.remove('activeModal');
  }

  return (
    <div className={styles.container}>
      <div className={styles.calendarContainer}>
        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="typeFilter" className={styles.filterLabel}>
              Show:
            </label>
            <select
              id="typeFilter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.typeFilter}
            >
              <option value="all">All Items</option>
              <option value="tasks">Tasks Only</option>
              <option value="events">Events Only</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="categoryFilter" className={styles.filterLabel}>
              Category:
            </label>
            <select
              id="categoryFilter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categoryFilter}
            >
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className={styles.calendar}
        />
        <div className={styles.legend}>
          {selectedType !== 'events' && (
            <div className={styles.legendItem}>
              <div className={styles.taskDot} />
              <span>Active Tasks</span>
            </div>
          )}
          {selectedType !== 'events' && (
            <div className={styles.legendItem}>
              <div className={styles.completedDot} />
              <span>Completed Tasks</span>
            </div>
          )}
          {selectedType !== 'tasks' && (
            <div className={styles.legendItem}>
              <div className={styles.eventDot} />
              <span>Events</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.itemsContainer}>
        <h2 className={styles.dateTitle}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>

        {(activeTasks.length > 0 || selectedEvents.length > 0) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Active Items</h3>
            {activeTasks.length > 0 && (
              <div className={styles.subsection}>
                <h4 className={styles.subsectionTitle}>Tasks</h4>
                <div className={styles.itemsList}>
                  {activeTasks.map(task => (
                    <div key={task.id} className={styles.taskItem}>
                      <div className={styles.itemHeader}>
                        <h4>{task.name}</h4>
                        <div className={styles.headerRight}>
                          <span className={styles.time}>
                            Due: {formatTime(task.dateTime)}
                          </span>
                          <img 
                            src={EditIcon}
                            alt="Edit"
                            className={styles.editIcon}
                            onClick={() => openEditTaskModal(task)}
                            title="Edit Task"
                          />
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`${styles.statusSelect} ${styles[task.status.toLowerCase().replace(' ', '')]}`}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      {task.description && (
                        <p className={styles.description}>{task.description}</p>
                      )}
                      <div className={styles.itemFooter}>
                        <span 
                          className={styles.category}
                          style={{ backgroundColor: getTaskCategoryColor(task) }}
                        >
                          {task.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedEvents.length > 0 && (
              <div className={styles.subsection}>
                <h4 className={styles.subsectionTitle}>Events</h4>
                <div className={styles.itemsList}>
                  {selectedEvents.map(event => (
                    <div key={event.id} className={styles.eventItem}>
                      <div className={styles.itemHeader}>
                        <h4>{event.name}</h4>
                        <div className={styles.headerRight}>
                          <span className={styles.time}>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </span>
                          <img 
                            src={EditIcon}
                            alt="Edit"
                            className={styles.editIcon}
                            onClick={() => openEditEventModal(event)}
                            title="Edit Event"
                          />
                          <select
                            value={event.status}
                            onChange={(e) => handleEventStatusChange(event.id, e.target.value)}
                            className={`${styles.statusSelect} ${styles[event.status.toLowerCase().replace(' ', '')]}`}
                          >
                            <option value="Not Completed">Not Completed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      {event.description && (
                        <p className={styles.description}>{event.description}</p>
                      )}
                      <div className={styles.itemFooter}>
                        <span 
                          className={styles.category}
                          style={{ backgroundColor: getEventCategoryColor(event) }}
                        >
                          {event.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Completed Tasks</h3>
            <div className={styles.itemsList}>
              {completedTasks.map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.itemHeader}>
                    <h4>{task.name}</h4>
                    <div className={styles.headerRight}>
                      <span className={styles.time}>
                        Due: {formatTime(task.dateTime)}
                      </span>
                      <img 
                        src={EditIcon}
                        alt="Edit"
                        className={styles.editIcon}
                        onClick={() => openEditTaskModal(task)}
                        title="Edit Task"
                      />
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`${styles.statusSelect} ${styles[task.status.toLowerCase().replace(' ', '')]}`}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  {task.description && (
                    <p className={styles.description}>{task.description}</p>
                  )}
                  <div className={styles.itemFooter}>
                    <span 
                      className={styles.category}
                      style={{ backgroundColor: getTaskCategoryColor(task) }}
                    >
                      {task.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {editTaskModal && editingTask && (
          <div className={styles.modal}>
            <div className={styles.overlay} onClick={closeEditTaskModal}></div>
            <div className={styles.modalContent}>
              <button onClick={closeEditTaskModal} className={styles.closeModal}>X</button>
              <EditTaskModal 
                task={editingTask} 
                toggleEditTaskModal={closeEditTaskModal}
                onTaskUpdated={handleTaskUpdated}
              />
            </div>
          </div>
        )}

        {editEventModal && editingEvent && (
          <div className={styles.modal}>
            <div className={styles.overlay} onClick={closeEditEventModal}></div>
            <div className={styles.modalContent}>
              <button onClick={closeEditEventModal} className={styles.closeModal}>X</button>
              <EditEventModal 
                event={editingEvent} 
                toggleEditEventModal={closeEditEventModal}
                onEventUpdated={handleEventUpdated}
              />
            </div>
          </div>
        )}

        {activeTasks.length === 0 && completedTasks.length === 0 && selectedEvents.length === 0 && (
          <div className={styles.emptyState}>
            No tasks or events scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
}

export default TasksPlusEvents;
