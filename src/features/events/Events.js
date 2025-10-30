import React, { useState } from 'react';
import styles from './modules/Events.module.css';
import AddEventModal from './AddEventModal';

import Event from './Event';

function Events() {
    const [modal, setModal] = useState(false);

    const toggleEventModal = () => {
        setModal(!modal);
    };

    if (modal) {
        document.body.classList.add('activeModal');
    } else {
        document.body.classList.remove('activeModal');
    };

    return (
        <div>
            <button onClick={toggleEventModal}>Add Event</button>

            {modal && 
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={toggleEventModal}></div>
                    <div className={styles.modalContent}>
                        
                        <button onClick={toggleEventModal} className={styles.closeModal}>X</button>
                        <AddEventModal toggleEventModal={toggleEventModal}></AddEventModal>
                        
                    </div>
                </div>
            }
            <Event />
        </div>
    );
}

export default Events;