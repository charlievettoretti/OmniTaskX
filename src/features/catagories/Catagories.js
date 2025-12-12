import React, { useState } from 'react';
//import { useSelector } from 'react-redux';
//import { selectCatagory } from './catagorySlice';
import styles from './modules/Catagories.module.css';

import AddCatagoryModal from './AddCatagoryModal';
//import Catagory from './Catagory';


function Catagories() {
    //const catagories = useSelector(selectCatagory);

    const [modal, setModal] = useState(false);

    const toggleCategoryModal = () => {
        setModal(!modal);
    };

    if (modal) {
        document.body.classList.add('activeModal');
    } else {
        document.body.classList.remove('activeModal');
    };

    return (
        <div>
            <button onClick={toggleCategoryModal} className={styles.addCatagoryButton}>Add Catagory</button>

            {modal && 
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={toggleCategoryModal}></div>
                    <div className={styles.modalContent}>
                        
                        <button onClick={toggleCategoryModal} className={styles.closeModal}>X</button>
                        <AddCatagoryModal toggleCategoryModal={toggleCategoryModal}></AddCatagoryModal>
                        
                    </div>
                </div>
            }
            {/*<Catagory />*/}
        </div>
    )
}

export default Catagories;