import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CommentsSettingsPage.module.css';

const CommentsSettingsPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Настройки комментариев</h1>
      <p className={styles.placeholderText}>
        Этот раздел находится в разработке. Здесь вы сможете настроить параметры комментариев.
      </p>
      <Link to="/settings" className={styles.backLink}>Назад к настройкам</Link>
    </div>
  );
};

export default CommentsSettingsPage; 