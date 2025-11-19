import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editEvent } from './eventSlice';
import { selectCatagory } from '../catagories/catagorySlice';
import styles from './modules/EditEventModal.module.css';

const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
  
    const d = new Date(dateStr);
  
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
  
    // This is exactly what <input type="datetime-local" /> expects
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

function EditEventModal({ event, toggleEditEventModal, onEventUpdated }) {
    const dispatch = useDispatch();
    const categories = useSelector(selectCatagory);
    /*
    const [eventName, setEventName] = useState(event.name);
    const [eventCategory, setEventCategory] = useState(event.catagory);
    const [eventCategoryId, setEventCategoryId] = useState(event.category_id);
    const [description, setDescription] = useState(event.description);
    const [startTime, setStartTime] = useState(event.startTime);
    const [endTime, setEndTime] = useState(event.endTime);
    const [isSubmitting, setIsSubmitting] = useState(false);
    */
    const [eventName, setEventName] = useState('');
    const [eventCategoryId, setEventCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setEventName(event.name);
        /*setEventCategory(event.catagory);*/
        //setEventCategoryId(event.category_id);
        setEventCategoryId(
            event.category_id != null ? String(event.category_id) : ''
          );
        setDescription(event.description);
        //setStartTime(event.startTime);
        //setEndTime(event.endTime);
        setStartTime(formatDateForInput(event.startTime));
        setEndTime(formatDateForInput(event.endTime));
    }, [event]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!eventName.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {

            const categoryIdToSend = 
                eventCategoryId === '' ? null : Number(eventCategoryId);
            
            console.log('Submitting event update...');
            const response = await fetch(`http://localhost:4000/events/${event.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: eventName,
                    /*catagory: eventCategory,*/
                    description,
                    start_time: startTime,
                    end_time: endTime,
                    status: event.status,
                    category_id: categoryIdToSend
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update event');
            }

            const updatedEvent = await response.json();
            console.log('Event updated successfully:', updatedEvent);
            
            // Update Redux store
            dispatch(editEvent(updatedEvent));
            
            // Call the onEventUpdated callback
            await onEventUpdated();
            
            // The modal will be closed by the parent component
        } catch (error) {
            console.error('Error updating event:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.eventForm} onSubmit={handleSubmit}>
            <h3 className={styles.editEventTitle}>Edit Event</h3>
            <div>
                <label htmlFor="eventName">Event: </label>
                <input 
                    id='eventName'
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    type='text'
                    placeholder="Enter event title"
                    className={styles.eventNameInput}
                />
            </div>
            <div>
                <label htmlFor='eventCategory'>Category: </label>
                <select
                    id='eventCategory'
                    value={eventCategoryId || ''}
                    onChange={(e) => setEventCategoryId(Number(e.target.value))}
                >
                    <option value='' disabled>-- Select Category --</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="eventDesc">Description: </label>
                <textarea 
                    id='eventDesc'
                    rows="5" 
                    cols="30"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter event description"
                    className={styles.eventDescInput}
                />
            </div>
            <div>
                <label htmlFor="startTime">Start Time:</label>
                <input
                    id='startTime'
                    //value={formatDateForInput(startTime)}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    type='datetime-local'
                />
            </div>
            <div>
                <label htmlFor="endTime">End Time:</label>
                <input
                    id='endTime'
                    //value={formatDateForInput(endTime)}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    type='datetime-local'
                />
            </div>
            <button className={styles.updateButton} type='submit'>Update Event</button>
        </form>
    );
}

export default EditEventModal; 