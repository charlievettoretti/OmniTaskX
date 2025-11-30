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
const SLOT_MINUTES = 30;    // vertical resolution
const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;
const SLOT_COUNT = TOTAL_MINUTES / SLOT_MINUTES;

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

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

function getMinutesFromStart(dateStr) {
  const d = new Date(dateStr);
  const mins = d.getHours() * 60 + d.getMinutes() - DAY_START_HOUR * 60;
  return mins;
}

function diffMinutes(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (60 * 1000)));
}

// Check if two intervals overlap
function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// Assign lanes to blocks so overlaps are side by side
function assignLanes(blocks) {
  // Sort by start time, then by end time
  blocks.sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return a.endMin - b.endMin;
  });

  // First pass: assign lane index
  const active = [];
  for (const block of blocks) {
    // remove blocks that ended
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].endMin <= block.startMin) {
        active.splice(i, 1);
      }
    }

    // find smallest free lane
    const used = new Set(active.map((b) => b.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    block.lane = lane;
    active.push(block);
  }

  // Second pass: for each block, find max lane within its overlapping cluster
  for (const block of blocks) {
    let maxLane = block.lane;
    for (const other of blocks) {
      if (intervalsOverlap(block.startMin, block.endMin, other.startMin, other.endMin)) {
        if (other.lane > maxLane) maxLane = other.lane;
      }
    }
    block.laneCount = maxLane + 1; // lanes are 0-based
  }
}

// WEEKLY VIEW
function WeeklyView() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTask);
  const events = useSelector(selectEvent);

  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editEventModal, setEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchEvents());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  // Build time slots = one per 30 minutes
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let m = 0; m < TOTAL_MINUTES; m += SLOT_MINUTES) {
      const absoluteMins = DAY_START_HOUR * 60 + m;
      const hour = Math.floor(absoluteMins / 60);
      const minutes = absoluteMins % 60;
      const ampmHour = ((hour + 11) % 12) + 1;
      const suffix = hour < 12 ? 'AM' : 'PM';
      const label = minutes === 0 ? `${ampmHour}:00 ${suffix}` : '';
      slots.push(label);
    }
    return slots;
  }, []);

  // Build blocks for each day (tasks + events), with positions & lanes
  const blocksByDay = useMemo(() => {
    const result = Array.from({ length: 7 }, () => []);

    // Tasks
    tasks.forEach((task) => {
      if (!task.dateTime) return;
      if (!isWithinWeek(task.dateTime, weekStart)) return;

      const date = new Date(task.dateTime);
      const dayDiff = Math.floor(
        (stripTime(date) - stripTime(weekStart)) / (24 * 60 * 60 * 1000)
      );
      if (dayDiff < 0 || dayDiff > 6) return;

      const startMin = getMinutesFromStart(task.dateTime);
      const duration = task.estimated_duration_minutes || 30;
      const endMin = startMin + duration;

      result[dayDiff].push({
        id: `task-${task.id}`,
        kind: 'task',
        source: task,
        startMin,
        endMin,
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

      const startMin = getMinutesFromStart(event.startTime);
      const duration = event.endTime
        ? diffMinutes(event.startTime, event.endTime)
        : 30;
      const endMin = startMin + duration;

      result[dayDiff].push({
        id: `event-${event.id}`,
        kind: 'event',
        source: event,
        startMin,
        endMin,
      });
    });

    // For each day, assign lanes and compute % positions
    result.forEach((blocks) => {
      if (blocks.length === 0) return;

      // clamp mins into visible range and ensure a minimum height
      blocks.forEach((b) => {
        b.clampedStart = Math.max(0, Math.min(TOTAL_MINUTES, b.startMin));
        b.clampedEnd = Math.max(0, Math.min(TOTAL_MINUTES, b.endMin));

        if (b.clampedEnd <= b.clampedStart) {
          b.clampedEnd = b.clampedStart + 15; // min 15 min
        }
      });

      assignLanes(blocks);

      blocks.forEach((b) => {
        const top = (b.clampedStart / TOTAL_MINUTES) * 100;
        const height =
          ((b.clampedEnd - b.clampedStart) / TOTAL_MINUTES) * 100;

        b.topPercent = top;
        b.heightPercent = height;
      });
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

  /*
  // TESTING THE 'Now' Line
  useEffect(() => {
    const fakeNow = new Date();
    fakeNow.setHours(12, 25, 0, 0);
    setNow(fakeNow);
  }, []);*/

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
        {/* Time column: one row per 30-minute slot */}
        <div className={styles.timeColumn}>
          {timeSlots.map((label, idx) => (
            <div key={idx} className={styles.timeSlotLabel}>
              {label}
            </div>
          ))}
        </div>

        {/* 7 day columns */}
        <div className={styles.daysContainer}>
          {blocksByDay.map((blocks, dayIndex) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + dayIndex);
            const isToday = isSameDay(dayDate, now);

            const nowMinutesFromStart =
              now.getHours() * 60 + now.getMinutes() - DAY_START_HOUR * 60;

            let nowTopPercent = null;
            if (isToday && nowMinutesFromStart >= 0 && nowMinutesFromStart <= TOTAL_MINUTES) {
              nowTopPercent = (nowMinutesFromStart / TOTAL_MINUTES) * 100;
            }

            return (
              <div key={dayIndex} className={styles.dayColumn}>
                <div className={styles.dayColumnInner}>
                  {/* Background rows (lines) */}
                  <div className={styles.slotBackground}>
                    {Array.from({ length: SLOT_COUNT }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`${styles.slotRow} ${
                          idx % 2 === 0 ? styles.hourRow : ''
                        }`}
                      />
                    ))}
                  </div>

                  {/* Foreground: blocks + now line */}
                  <div className={styles.blocksLayer}>
                    {nowTopPercent !== null && (
                      <div
                        className={styles.nowLine}
                        style={{ top: `${nowTopPercent}%` }}
                      />
                    )}

                    {blocks.map((block) => {
                      const { kind, source } = block;
                      const isTask = kind === 'task';
                      const category = source.category;

                      // Category background in block
                      const categoryColor = 
                        category?.color ?? 
                        source.categoryColor ?? 
                        source.category_color ?? 
                        (isTask ? '#4B9CE2' : '#34D399'); // defaults to blue or green
                    
                      const categoryName = category?.name ?? source.categoryName ?? null;

                      const widthPercent = 100 / (block.laneCount || 1);
                      const leftPercent = widthPercent * (block.lane || 0);

                      return (
                        <div
                          key={block.id}
                          className={
                            isTask ? styles.taskBlock : styles.eventBlock
                          }
                          style={{
                            top: `${block.topPercent}%`,
                            height: `${block.heightPercent}%`,
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: categoryColor,
                          }}
                          onClick={() =>
                            isTask
                              ? openEditTaskModal(source)
                              : openEditEventModal(source)
                          }
                          title={source.description || source.name}
                        >
                          <div className={styles.blockTitle}>{source.name}</div>
                          {category?.name && (
                            <div className={styles.blockMeta}>
                              {categoryName}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
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
