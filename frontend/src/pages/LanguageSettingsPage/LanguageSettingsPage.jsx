import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LanguageSettingsPage.module.css';

const LanguageSettingsPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Настройки языка</h1>
      <p className={styles.placeholderText}>
        Этот раздел находится в разработке. Здесь вы сможете изменить язык интерфейса.
      </p>
      <Link to="/settings" className={styles.backLink}>Назад к настройкам</Link>
    </div>
  );
};

export default LanguageSettingsPage; 