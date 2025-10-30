import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCatagory, fetchCategories } from './catagorySlice';

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
        <form onSubmit={handleSubmit}>
            <h3>Edit Category</h3>
            <label>
                Name: 
                <input
                type="text"
                value={catagoryName}
                onChange={(e) => setCatagoryName(e.target.value)}
                />
            </label>
            <br />
            <label>
                Color: 
                <input
                type="color"
                value={catagoryColor}
                onChange={(e) => setCatagoryColor(e.target.value)}
                />
            </label>
            <br />
            <button type="submit">Save Changes</button>
        </form>
    );
}

export default EditCatagoryModal;