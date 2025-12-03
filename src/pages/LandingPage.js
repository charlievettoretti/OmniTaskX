import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './modules/LandingPage.module.css';
import logo from '../components/logos/black_lettering.svg';

function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={styles.landing}>
            <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
                <img className={styles.wordLogo} src={logo} alt='logo' />
                {/*
                <div className={styles.logo}>
                    <span className={styles.logoMark}></span>
                    <span className={styles.logoText}>OmniTask</span>
                </div>*/}

                <nav className={styles.navLinks}>
                    <Link to="/login" className={styles.buttons}>Login</Link>
                    <Link to="/login" className={styles.buttons}>Get Started</Link>
                </nav>
            </header>

            {/* HERO */}
            <main className={styles.hero}>
                <div className={styles.textBlock}>
                <h1>
                    Make your time <br />
                    work for you.
                </h1>

                <p>
                    OmniTask is your AI-powered life operating system — combining tasks, 
                    events, routines, AI scheduling and group collaboration into one clean workspace.
                </p>

                <div className={styles.ctaRow}>
                    <Link to="/login" className={styles.primaryBtn}>Join now for FREE!</Link>
                    <button 
                    className={styles.secondaryBtn}
                    onClick={() =>
                        document.getElementById("how-it-works")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    >
                    How it works
                    </button>
                </div>
                </div>
                {/*
                <div className={styles.heroCard}>
                <div className={styles.inputFake}>What do you want to accomplish today?</div>

                <div className={styles.pillRow}>
                    <span className={styles.pill}>📅 Plan my week</span>
                    <span className={styles.pill}>🧠 AI Suggestions</span>
                    <span className={styles.pill}>👥 Group Tasks</span>
                    <span className={styles.pill}>Autoscheduling feature for General Tasks</span>
                </div>
                </div>*/}
            </main>


            {/* About / Backstory */}
            <section id="how-it-works" className={styles.section}>
                <h2>What is OmniTask?</h2>

                <p>
                OmniTask turns your schedule into an intelligent system that works for you.
                AI learns your priorities, finds time for tasks, prevents overload, and
                builds balanced days.
                </p>

                <div className={styles.features}>
                <div className={styles.featureCard}>
                    <h3>⚡ AI Scheduling</h3>
                    <p>Generate an ideal plan for your day or week instantly.</p>
                </div>

                <div className={styles.featureCard}>
                    <h3>📆 Tasks + Events</h3>
                    <p>Your time, commitments and priorities all in one interface.</p>
                </div>

                <div className={styles.featureCard}>
                    <h3>👥 Groups</h3>
                    <p>Work together — assign tasks, track ownership, collaborate clearly.</p>
                </div>
                <div className={styles.featureCard}>
                    <h3>Auto-Scheduling</h3>
                    <p>Automatically schedule tasks without a given time to fit your schedule.</p>
                </div>
                <div className={styles.featureCard}>
                    <h3>Prioritize Tasks</h3>
                    <p>Select a priority level and enter a flexibility type to help generate the perfect schedule!</p>
                </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
