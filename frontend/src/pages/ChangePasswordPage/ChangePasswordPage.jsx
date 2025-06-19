import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { changeUserPassword, clearChangePasswordState } from '../../Redux/changePasswordSlice';
import styles from './ChangePasswordPage.module.css';

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, successMessage, error } = useSelector((state) => state.changePassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {

    return () => {
      dispatch(clearChangePasswordState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {

      setTimeout(() => {
        navigate('/settings');
      }, 2000); 
    }
  }, [successMessage, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearChangePasswordState());

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setFormError('Все поля обязательны для заполнения.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFormError('Новый пароль и его подтверждение не совпадают.');
      return;
    }
    if (newPassword.length < 6) { 
      setFormError('Новый пароль должен быть не менее 6 символов.');
      return;
    }

    dispatch(changeUserPassword({ currentPassword, newPassword }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Сменить пароль</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="currentPassword">Текущий пароль</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="newPassword">Новый пароль</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="confirmNewPassword">Подтвердите новый пароль</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        {formError && <p className={styles.errorMessage}>{formError}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Сохранение...' : 'Сменить пароль'}
        </button>
      </form>
      <Link to="/settings" className={styles.backLink}>Назад к настройкам</Link>
    </div>
  );
};

export default ChangePasswordPage; 