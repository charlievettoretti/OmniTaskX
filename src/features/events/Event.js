import React from 'react';
import { useSelector } from 'react-redux';
import { selectEvent } from './eventSlice';
import styles from './modules/Event.module.css';

function Event() {
    const events = useSelector(selectEvent);

    return (
        <div>
            <div className={styles.eventList}>
                <ul>
                    {events.map(event => (
                        <li key={event.id}>{event.name} + {event.catagory}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
};

export default Event;