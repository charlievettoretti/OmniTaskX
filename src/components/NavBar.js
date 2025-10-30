import React from 'react';
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

import logo from './logos/black_lettering.svg';



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
    const navBarList = ['Dashboard', 'Profile', 'Group', 'To-Do', 'Calendar', 'AI', 'Settings'];

    const imgSrc = {
        "Dashboard": DashboardIcon,
        "Profile": ProfileIcon,
        "Group": GroupIcon,
        "To-Do": ToDoIcon,
        "Calendar": CalendarIcon,
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
                <button className={styles.navItem} onClick={handleLogout}>
                    <div className={styles.navList}>
                        <div className={styles.navContent}>
                            <img src={LogoutIcon} className={styles.icons} alt="Logout" />
                            <span className={styles.Logout}>Logout</span>
                        </div>
                    </div>
                </button>
            </div>
            <Outlet />
        </div>

    );
}

export default NavBar;