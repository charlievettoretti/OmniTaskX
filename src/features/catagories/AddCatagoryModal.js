import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addCatagory } from './catagorySlice';

import styles from './modules/AddCatagoryModal.module.css';

function AddCatagoryModal({ toggleCategoryModal }) {

    const dispatch = useDispatch();
    const colorOptions = [
        {name: 'White', hex: '#ffffff'},
        { name: 'Red', hex: '#f94144' },
        { name: 'Orange', hex: '#f3722c' },
        { name: 'Yellow', hex: '#f9c74f' },
        { name: 'Green', hex: '#90be6d' },
        { name: 'Blue', hex: '#577590' },
        { name: 'Purple', hex: '#6a4c93' },
        { name: 'Pink', hex: '#ff69b4' },
        { name: 'Grey', hex: '#7f8c8d' },
        { name: 'Brown', hex: '#8e6e53' },
        { name: 'Black', hex: '#000000' },
      ];
    

    /*const [catagoryId, setCatagoryId] = useState('');*/
    const [catagoryName, setCatagoryName] = useState('');
    const [catagoryColor, setCatagoryColor] = useState(''); // defaults to WHITE ... for some reason ...
    /*
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!catagoryName.trim()) return;

        dispatch(addCatagory({
            catagoryName,
            catagoryColor
        }));

        toggleCatagoryModal();
        setCatagoryName('');
        setCatagoryColor('');
    }*/
   const handleSubmit = async (e) => {
        e.preventDefault();
        if (!catagoryName.trim()) return;

        const newCatagory = {
            name: catagoryName,
            color: catagoryColor
        };

        try {
            const response = await fetch('http://localhost:4000/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newCatagory)
            });
            
            if (!response.ok) throw new Error('Failed to create category');
            const data = await response.json();

            dispatch(addCatagory({
                catagoryName: data.name,
                catagoryColor: data.color
            }));
            toggleCategoryModal();
            setCatagoryName('');
            setCatagoryColor('');
        } catch (err) {
            console.error('Failed to save category', err);
        }
    };




    return (
        <form className={styles.catagoryForm} onSubmit={handleSubmit}>
            <h3 className={styles.newCatagoryTitle}>Add New Catagory:</h3>
            <div>
                <label htmlFor='catagoryName'>Catagory:</label>
                <br />
                <input
                id='catagoryName'
                value={catagoryName}
                onChange={(e) => setCatagoryName(e.target.value)}
                type='text'
                placeholder='Enter catagory name'
                className={styles.catagoryNameInput}></input>
                <br />
            </div>
            <div>
                <label htmlFor='catagoryColor'>Color:</label>
                <br />
                <select
                id='catagoryColor'
                value={catagoryColor}
                onChange={(e) => setCatagoryColor(e.target.value)}>
                    <option value='' disabled>-- Select Color --</option>
                    {colorOptions.map(color => (
                        <option key={color.hex} value={color.hex}>{color.name}</option>
                    ))}
                </select>
                <br />
                <button className={styles.addButton} type='submit'>Add Catagory</button>
            </div>
        </form>
    )
}

export default AddCatagoryModal;