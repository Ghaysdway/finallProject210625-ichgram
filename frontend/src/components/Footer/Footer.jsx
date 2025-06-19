import React from 'react';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <nav className={styles.nav}>
      <span>Home</span>
      <span>Search</span>
      <span>Explore</span>
      <span>Messages</span>
      <span>Notifications</span>
      <span>Create</span>
    </nav>
    <div className={styles.copyright}>
      © 2024 ICHgram
    </div>
  </footer>
);

export default Footer; 