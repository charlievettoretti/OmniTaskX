import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCatagory, fetchCategories } from './catagorySlice';
import styles from './modules/AddCatagoryModal.module.css';

function EditCatagoryModal({ catagory, toggleEditCatagoryModal }) {
    const dispatch = useDispatch();

    const [catagoryName, setCatagoryName] = useState(catagory.name);
    const [catagoryColor, setCatagoryColor] = useState(catagory.color);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!catagoryName.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:4000/categories/${catagory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: catagoryName,
                    color: catagoryColor
                })
            });
            if (!response.ok) throw new Error('Failed to update category');
            const updatedCategory = await response.json();
            
            dispatch(updateCatagory({updatedCategory}));
            await dispatch(fetchCategories());
            toggleEditCatagoryModal();

        } catch (err) {
            console.error('Error updating category:', err);
            setIsSubmitting(false);
        }
        /*
        dispatch(updateCatagory({
            id: catagory.id,
            name: catagoryName,
            color: catagoryColor
        }));
        toggleEditCatagoryModal();*/
    }

    return (
        <form className={styles.catagoryForm} onSubmit={handleSubmit}>
            <h3 className={styles.newCatagoryTitle}>Edit Category</h3>
            <div>
                <label htmlFor='catagoryName'>Category:</label>
                <br />
                <input
                    id='catagoryName'
                    type="text"
                    value={catagoryName}
                    onChange={(e) => setCatagoryName(e.target.value)}/>
                <br />
            </div>
            <div>
                <label htmlFor='catagoryColor'>Color:</label> 
                <br />
                <input
                    id='catagoryColor'
                    type="color"
                    value={catagoryColor}
                    onChange={(e) => setCatagoryColor(e.target.value)} />
                <br />
            </div>
            <button type="submit" className={styles.addButton}>Save Changes</button>
        </form>
    );
}

export default EditCatagoryModal;