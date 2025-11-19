import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTask, fetchTasks } from '../features/tasks/taskSlice';
import { selectEvent, fetchEvents } from '../features/events/eventSlice';
import { fetchCategories } from '../features/catagories/catagorySlice';

import EditTaskModal from '../features/tasks/EditTaskModal';
import EditEventModal from '../features/events/EditEventModal';

import styles from './modules/WeeklyView.module.css';

const DAY_START_HOUR = 7;   // 7 AM
const DAY_END_HOUR = 21;    // 9 PM
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Get Monday of the week for a given date
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function stripTime(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWithinWeek(dateStr, weekStart) {
  const date = new Date(dateStr);
  const start = stripTime(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 7); // exclusive
  return date >= start && date < end;
}

// Convert a datetime string + duration into grid row indices
function getRowRange(dateStr, durationMinutes) {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const startMinutes = date.getHours() * 60 + date.getMinutes();
  const dayStartMinutes = DAY_START_HOUR * 60;
  const dayEndMinutes = DAY_END_HOUR * 60;

  // Completely outside the visible range
  if (startMinutes >= dayEndMinutes) return null;

  let fromStart = startMinutes - dayStartMinutes;
  if (fromStart < 0) fromStart = 0; // clamp up

  const slotIndex = Math.floor(fromStart / SLOT_MINUTES) + 1; // grid rows are 1-based
  const slotsNeeded = Math.max(1, Math.ceil((durationMinutes || 30) / SLOT_MINUTES));

  let rowStart = slotIndex;
  let rowEnd = rowStart + slotsNeeded;

  // Clamp end to within the grid
  if (rowEnd > TOTAL_SLOTS + 1) {
    rowEnd = TOTAL_SLOTS + 1;
  }

  return { rowStart, rowEnd };
}

// Minutes diff helper
function diffMinutes(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (60 * 1000)));
}

function WeeklyView() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTask);
  const events = useSelector(selectEvent);

  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editEventModal, setEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchEvents());
    dispatch(fetchCategories());
  }, [dispatch]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
      const ampmHour = ((hour + 11) % 12) + 1;
      const suffix = hour < 12 ? 'AM' : 'PM';
      slots.push(`${ampmHour}:00 ${suffix}`);
      // if you want 30-min labels, add another here
      // slots.push(`${ampmHour}:30 ${suffix}`);
    }
    return slots;
  }, []);

  // Map tasks & events into a structure indexed by dayIndex (0-6)
  const itemsByDay = useMemo(() => {
    const result = Array.from({ length: 7 }, () => ({
      tasks: [],
      events: [],
    }));

    // Scheduled tasks: those with a concrete dateTime
    tasks.forEach((task) => {
      if (!task.dateTime) return;
      if (!isWithinWeek(task.dateTime, weekStart)) return;

      const date = new Date(task.dateTime);
      const dayDiff = Math.floor(
        (stripTime(date) - stripTime(weekStart)) / (24 * 60 * 60 * 1000)
      );
      if (dayDiff < 0 || dayDiff > 6) return;

      const duration = task.estimated_duration_minutes || 30;
      const rowRange = getRowRange(task.dateTime, duration);
      if (!rowRange) return;

      result[dayDiff].tasks.push({
        ...task,
        rowStart: rowRange.rowStart,
        rowEnd: rowRange.rowEnd,
      });
    });

    // Events
    events.forEach((event) => {
      if (!event.startTime) return;
      if (!isWithinWeek(event.startTime, weekStart)) return;

      const date = new Date(event.startTime);
      const dayDiff = Math.floor(
        (stripTime(date) - stripTime(weekStart)) / (24 * 60 * 60 * 1000)
      );
      if (dayDiff < 0 || dayDiff > 6) return;

      const duration = event.endTime
        ? diffMinutes(event.startTime, event.endTime)
        : 30;

      const rowRange = getRowRange(event.startTime, duration);
      if (!rowRange) return;

      result[dayDiff].events.push({
        ...event,
        rowStart: rowRange.rowStart,
        rowEnd: rowRange.rowEnd,
      });
    });

    // Sort items in each day by start row
    result.forEach((day) => {
      day.tasks.sort((a, b) => a.rowStart - b.rowStart);
      day.events.sort((a, b) => a.rowStart - b.rowStart);
    });

    return result;
  }, [tasks, events, weekStart]);

  const goToPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(getStartOfWeek(d));
  };

  const goToNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(getStartOfWeek(d));
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setEditTaskModal(true);
  };

  const closeEditTaskModal = () => {
    setEditingTask(null);
    setEditTaskModal(false);
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEditEventModal(true);
  };

  const closeEditEventModal = () => {
    setEditingEvent(null);
    setEditEventModal(false);
  };

  const handleTaskUpdated = async () => {
    await dispatch(fetchTasks());
    closeEditTaskModal();
  };

  const handleEventUpdated = async () => {
    await dispatch(fetchEvents());
    closeEditEventModal();
  };

  if (editTaskModal || editEventModal) {
    document.body.classList.add('activeModal');
  } else {
    document.body.classList.remove('activeModal');
  }

  return (
    <div className={styles.weeklyViewContainer}>
      {/* Header / navigation */}
      <div className={styles.weekHeader}>
        <button onClick={goToPrevWeek} className={styles.navButton}>
          ◀
        </button>
        <div className={styles.weekLabel}>
          Week of{' '}
          {weekStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}{' '}
          –{' '}
          {weekEnd.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
        <button onClick={goToNextWeek} className={styles.navButton}>
          ▶
        </button>
      </div>

      {/* Column headers */}
      <div className={styles.headerRow}>
        <div className={styles.timeColumnHeader} />
        {dayLabels.map((label, idx) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + idx);
          return (
            <div key={label} className={styles.dayHeader}>
              <div className={styles.dayHeaderLabel}>{label}</div>
              <div className={styles.dayHeaderDate}>
                {date.getMonth() + 1}/{date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body grid */}
      <div className={styles.scheduleBody}>
        {/* Time labels column */}
        <div className={styles.timeColumn}>
          {timeSlots.map((label) => (
            <div key={label} className={styles.timeSlotLabel}>
              {label}
            </div>
          ))}
        </div>

        {/* 7 day columns */}
        <div className={styles.daysContainer}>
          {itemsByDay.map((day, dayIndex) => (
            <div key={dayIndex} className={styles.dayColumn}>
              <div
                className={styles.dayColumnGrid}
                style={{ gridTemplateRows: `repeat(${TOTAL_SLOTS}, 1fr)` }}
              >
                {/* Background time cells */}
                {Array.from({ length: TOTAL_SLOTS }).map((_, idx) => (
                  <div key={idx} className={styles.timeCell} />
                ))}

                {/* Tasks */}
                {day.tasks.map((task) => (
                  <div
                    key={`task-${task.id}`}
                    className={styles.taskBlock}
                    style={{
                      gridRowStart: task.rowStart,
                      gridRowEnd: task.rowEnd,
                      backgroundColor: task.category?.color || '#4B9CE2',
                    }}
                    onClick={() => openEditTaskModal(task)}
                    title={task.description || task.name}
                  >
                    <div className={styles.blockTitle}>{task.name}</div>
                    {task.category?.name && (
                      <div className={styles.blockMeta}>
                        {task.category.name}
                      </div>
                    )}
                  </div>
                ))}

                {/* Events */}
                {day.events.map((event) => (
                  <div
                    key={`event-${event.id}`}
                    className={styles.eventBlock}
                    style={{
                      gridRowStart: event.rowStart,
                      gridRowEnd: event.rowEnd,
                      backgroundColor: event.category?.color || '#34D399',
                    }}
                    onClick={() => openEditEventModal(event)}
                    title={event.description || event.name}
                  >
                    <div className={styles.blockTitle}>{event.name}</div>
                    {event.category?.name && (
                      <div className={styles.blockMeta}>
                        {event.category.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {editTaskModal && editingTask && (
        <div className={styles.modal}>
          <div className={styles.overlay} onClick={closeEditTaskModal}></div>
          <div className={styles.modalContent}>
            <button onClick={closeEditTaskModal} className={styles.closeModal}>
              X
            </button>
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
            <button onClick={closeEditEventModal} className={styles.closeModal}>
              X
            </button>
            <EditEventModal
              event={editingEvent}
              toggleEditEventModal={closeEditEventModal}
              onEventUpdated={handleEventUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyView;
