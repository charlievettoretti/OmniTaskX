import React from 'react';
import { useSelector } from 'react-redux';
import { selectEvent } from './eventSlice';
import styles from './modules/Event.module.css';
import { selectCatagory } from '../catagories/catagorySlice';

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function Event() {
    const events = useSelector(selectEvent);
    const categories = useSelector(selectCatagory);

    const categoryMap = Object.fromEntries(
        categories.map(cat => [cat.id, cat])
      );

    return (
        <div>
            <div className={styles.eventList}>
                <ul>
                    {events.map(event => (
                        <li key={event.id}>{event.name}: {formatTime(event.startTime)}-
                        {formatTime(event.endTime)}  ({categoryMap[event.category_id]?.name || 'Uncategorized'})</li>
                    ))}
                </ul>
            </div>
        </div>
    )
};

export default Event;