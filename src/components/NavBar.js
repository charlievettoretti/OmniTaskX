import React, { useState, useRef } from 'react';
import styles from './modules/NavBar.module.css';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import DashboardIcon from './icons/DashboardIcon1.svg';
import ProfileIcon from './icons/ProfileIcon.svg';
import ToDoIcon from './icons/To-DoIcon.svg';
import SettingsIcon from './icons/SettingsIcon.svg';
import GroupIcon from './icons/GroupIcon.svg';
import CalendarIcon from './icons/CalendarIcon.svg';
import AIIcon from './icons/AIIcon.svg';
import LogoutIcon from './icons/logout.svg';
import PlusSquareIcon from './icons/Plus-Square.svg';
import WeeklyIcon from './icons/WeeklyIcon.svg';

import logo from './logos/black_lettering.svg';

// FOR QUICK ADD MENU
import QuickAddMenu from './QuickAddMenu';

import AddTaskModal from '../features/tasks/AddTaskModal';
import AddEventModal from '../features/events/AddEventModal';
import AddCatagoryModal from '../features/catagories/AddCatagoryModal';

function NavBar() {
    const navigate = useNavigate();
    const handleLogout = async (e) => {
        try {
            await fetch('http://localhost:4000/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userId');
            navigate('/login');
        } catch (err) {
            console.error('Logout Failed: ', err);
        }
    };

    const [addTaskModal, setAddTaskModal] = useState(false);
    const [addEventModal, setAddEventModal] = useState(false);
    const [addCategoryModal, setAddCategoryModal] = useState(false);

    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const quickAddTimeoutRef = useRef(null);

    if (addTaskModal || addEventModal || addCategoryModal) {
        document.body.classList.add('activeModal');
    } else {
        document.body.classList.remove('activeModal');
    }

    const toggleTaskModal = () => {
        setAddTaskModal(!addTaskModal);
    }
    const toggleEventModal = () => {
        setAddEventModal(!addEventModal);
    }
    const toggleCategoryModal = () => {
        setAddCategoryModal(!addCategoryModal);
    }

    const navBarList = ['Dashboard', 'Profile', 'Group', 'To-Do', 'Calendar', 'Weekly', 'AI', 'Settings'];

    const imgSrc = {
        "Dashboard": DashboardIcon,
        "Profile": ProfileIcon,
        "Group": GroupIcon,
        "To-Do": ToDoIcon,
        "Calendar": CalendarIcon,
        "Weekly": WeeklyIcon,
        "AI": AIIcon,
        "Settings": SettingsIcon
    };

    const listItems = navBarList.map(item => 
        <NavLink 
        to={`/${item.toLowerCase()}`}
        key={item}
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            
            <li 
            >
                <div className={styles.navContent}>
                    <img src={imgSrc[item]} className={styles.icons} alt='icon' />
                    <span className={styles[item]}>{item}</span>
                </div>
            </li>
        </NavLink>
        );


    return (
        <div>
            <div className={styles.navContainer}>
                <img src={logo} className={styles.miniLogo} alt="logo" />
                <ul className={styles.navList}>
                    {listItems}
                </ul>
                {/*}
                <button className={styles.logoutButton} onClick={handleLogout}>
                    <div className={styles.navContent}>
                        <img src={LogoutIcon} className={styles.icons} alt='icon' />
                        <span className={styles.logoutText}>Logout</span>
                    </div>
                </button>
                {*/}
                {/*<NavLink 
                to="/logout" 
                onClick={handleLogout} 
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                <div className={styles.navList}>
                    <li key='logout'>
                        <div className={styles.navContent}>
                            <img src={LogoutIcon} className={styles.icons} alt="Logout" />
                            <span className={styles.Logout}>Logout</span>
                        </div>
                    </li>
                </div>
                </NavLink>*/}

                <ul className={styles.navListBottom}>
                    <li className={styles.navItem}
                        onMouseEnter={() => {
                            if (quickAddTimeoutRef.current) {
                                clearTimeout(quickAddTimeoutRef.current);
                                quickAddTimeoutRef.current = null;
                            }
                            setQuickAddOpen(true);
                        }}
                        onMouseLeave={() => {
                            quickAddTimeoutRef.current = setTimeout(() => {
                                setQuickAddOpen(false);
                                quickAddTimeoutRef.current = null;
                            }, 200);
                        }}
                    >
                        <div className={styles.navContent}>
                            <img src={PlusSquareIcon} className={styles.icons} alt="Quick Add" />
                            <QuickAddMenu
                                open={quickAddOpen}
                                onAddTask={() => setAddTaskModal(true)}
                                onAddEvent={() => setAddEventModal(true)}
                                onAddCategory={() => setAddCategoryModal(true)}
                            />
                        </div>
                    </li>
                </ul>
      

                <button className={styles.navItem} onClick={handleLogout}>
                    <div className={styles.navList}>
                        <div className={styles.navContent}>
                            <img src={LogoutIcon} className={styles.icons} alt="Logout" />
                            <span className={styles.Logout}>Logout</span>
                        </div>
                    </div>
                </button>


                {/*
                <ul className={styles.navListBottom}>
                    <li className={styles.navItem}>
                    <div className={styles.navContent}>
                        <img src={PlusSquareIcon} className={styles.icons} alt="Quick Add" />
                        <QuickAddMenu
                        onAddTask={() => setAddTaskModal(true)}
                        onAddEvent={() => setAddEventModal(true)}
                        onAddCategory={() => setAddCategoryModal(true)}
                        />
                    </div>
                    </li>

                    <li className={styles.navItem} onClick={handleLogout}>
                    <div className={styles.navContent}>
                        <img src={LogoutIcon} className={styles.icons} alt="Logout" />
                        <span className={styles.Logout}>Logout</span>
                    </div>
                    </li>
                </ul>*/}
            </div>
            <Outlet />
            {addTaskModal && (
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={toggleTaskModal}></div>
                        <div className={styles.modalContent}>
                            <button onClick={toggleTaskModal} className={styles.closeModal}>
                                X
                            </button>
                            <AddTaskModal
                                toggleTaskModal={toggleTaskModal}
                                //onEventUpdated={handleEventAdded}
                            />
                        </div>
                    </div>
            )}
            {addEventModal && (
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={toggleEventModal}></div>
                        <div className={styles.modalContent}>
                            <button onClick={toggleEventModal} className={styles.closeModal}>
                                X
                            </button>
                            <AddEventModal
                                toggleEventModal={toggleEventModal}
                                //onEventUpdated={handleEventAdded}
                            />
                        </div>
                    </div>
            )}
            {addCategoryModal && (
                <div className={styles.modal}>
                    <div className={styles.overlay} onClick={toggleCategoryModal}></div>
                        <div className={styles.modalContent}>
                            <button onClick={toggleCategoryModal} className={styles.closeModal}>
                                X
                            </button>
                            <AddCatagoryModal
                                toggleCategoryModal={toggleCategoryModal}
                                //onEventUpdated={handleEventAdded}
                            />
                        </div>
                    </div>
            )}
        </div>

    );
}

export default NavBar;