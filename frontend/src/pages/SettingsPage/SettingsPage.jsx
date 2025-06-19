import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SettingsPage.module.css";

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };
  
  const handleComments = () => {
    navigate("/settings/comments");
  };

  const handleLanguage = () => {
    navigate("/settings/language");
  };

  const handleChangePassword = () => {
    navigate("/settings/change-password");
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.settingsTitle}>Настройки</h1>
      <div className={styles.settingsMenu}>
        <button className={styles.menuItem} onClick={handleEditProfile}>
          Редактировать профиль
        </button>
        <button className={styles.menuItem} onClick={handleComments}>
          Комментарии
        </button>
        <button className={styles.menuItem} onClick={handleLanguage}>
          Язык
        </button>
        <button className={styles.menuItem} onClick={handleChangePassword}>
          Сменить пароль
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
