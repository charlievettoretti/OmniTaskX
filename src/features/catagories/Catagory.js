import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCatagory } from './catagorySlice';
import styles from './modules/Catagory.module.css';
import EditCatagoryModal from './EditCatagoryModal';
import { fetchCategories } from './catagorySlice';

import EditIcon from '../../components/icons/EditIcon.svg';

function Catagory() {
    const catagories = useSelector(selectCatagory);
    const dispatch = useDispatch();

    const [editCatagoryModal, setEditCatagoryModal] = useState(false);

    /*const toggleEditCatagoryModal = () => {
        setEditCatagoryModal(!editCatagoryModal);
    };*/

    const [editingCatagory, setEditingCatagory] = useState(null);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const openEditCatagoryModal = (cat) => {
        setEditingCatagory(cat);
        setEditCatagoryModal(true);
    };

    const closeEditCatagoryModal = () => {
        setEditingCatagory(null);
        setEditCatagoryModal(false);
    };


    if (editCatagoryModal) {
        document.body.classList.add('activeModal');
    } else {
        document.body.classList.remove('activeModal');
    };

    return (
        <div className={styles.catagoryAll}>
            {/*<h2 className={styles.catagoryTitle}>Categories</h2>*/}
            <ul className={styles.catagoryList}>
                {catagories.map(catagory => (
                    <li className={styles.catagoryItem} key={catagory.id}>
                        <span 
                            className={styles.colorSquare}
                            style= {{ backgroundColor: catagory.color }}>
                        </span>
                    {catagory.name}
                    {/*<button onClick={toggleEditCatagoryModal}>Edit</button>*/}
                    {/*<button onClick={() => openEditCatagoryModal(catagory)}>Edit</button>*/}
                    <img 
                    className={styles.catagoryEditIcon} 
                    src={EditIcon} 
                    alt="Edit" 
                    title="Edit" 
                    onClick={() => openEditCatagoryModal(catagory)}></img>
                    </li>
                ))}
            </ul>
            {editCatagoryModal && editingCatagory && 
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={closeEditCatagoryModal}></div>
                    <div className={styles.modalContent}>
                    <button onClick={closeEditCatagoryModal} className={styles.closeModal}>X</button>
                    <EditCatagoryModal 
                        catagory={editingCatagory} 
                        toggleEditCatagoryModal={closeEditCatagoryModal} 
                    />
                    </div>
                </div>
            }
        </div>
    );
}

export default Catagory;