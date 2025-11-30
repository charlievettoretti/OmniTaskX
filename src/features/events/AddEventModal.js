import React, { useState } from 'react';
import styles from './modules/AddEventModal.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { addEvent } from './eventSlice.js';
import { selectCatagory } from '../catagories/catagorySlice.js';

function AddEventModal({ toggleEventModal }) {
    const dispatch = useDispatch();
    const catagories = useSelector(selectCatagory);

    const [eventName, setEventName] = useState('');
    //const [eventCatagory, setEventCatagory] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!eventName.trim()) return;

        const categoryIdToSend = 
            selectedCategoryId === '' || selectedCategoryId == null
                ? null
                : selectedCategoryId;

        const category = catagories.find(cat => cat.id === categoryIdToSend);

        const newEvent = {
            name: eventName,
            description,
            /*catagory: eventCatagory,*/
            start_time: startTime,
            end_time: endTime,
            status: 'Not Completed',
            category_id: categoryIdToSend,
        };

        try {
            const response = await fetch('http://localhost:4000/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newEvent)
            });
            if (!response.ok) throw new Error('Failed to create event');
            const data = await response.json();

            dispatch(addEvent({
                eventName: data.name,
                eventCatagory: data.catagory,
                startTime: data.start_time,
                endTime: data.end_time,
                description: data.description,
                category_id: data.category_id,
                categoryName: category?.name ?? null,
                categoryColor: category?.color ?? null
            }));
            toggleEventModal();
            setEventName('');
            //setEventCatagory('');
            setSelectedCategoryId('');
            setStartTime('');
            setEndTime('');
            setDescription('');
        } catch (err) {
            console.error('Failed to save event', err);
        }
    }

    return (
        <form className={styles.eventForm} onSubmit={handleSubmit}>
            <h3>Add New Event:</h3>
            <div>
                <label htmlFor='eventName'>Event:</label>
                <br />
                <input
                id='eventName'
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                type='text'
                placeholder='Enter event name'
                className={styles.eventNameInput}></input>
                <br />
            </div>
            <div>
                <label htmlFor='eventCatagory'>Category: </label>
                <br />
                <select
                    id='eventCatagory'
                    //value={eventCatagory}
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                >
                    <option value='' disabled>-- Select Category --</option>
                    {catagories.map(catagory => (
                        <option key={catagory.id} value={catagory.id}>{catagory.name}</option>
                    ))}
                </select>
                <br />
            </div>
            <div>
                <label htmlFor='description'>Description: </label>
                <br />
                <textarea
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='Enter event description'
                    rows="4"
                    className={styles.eventDescInput}
                />
                <br />
            </div>
            <div>
                <label htmlFor='startTime'>Start Time: </label>
                <br />
                <input
                    id='startTime'
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    type='datetime-local'
                />
                <br />
            </div>
            <div>
                <label htmlFor='endTime'>End Time: </label>
                <br />
                <input
                    id='endTime'
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    type='datetime-local'
                />
                <br />
            </div>
            <button className={styles.addButton} type='submit'>Add Event</button>
        </form>
    );
}

export default AddEventModal;