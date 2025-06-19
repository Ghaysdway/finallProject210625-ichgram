import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../../Redux/authSlice';
import styles from '../Auth/AuthForm.module.css';
import { LOGO_URL } from '../../config/constants';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !newPassword || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await dispatch(resetPassword({ email, newPassword })).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.message || 'Произошла ошибка при сбросе пароля');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.formContainer}>
          <div className={styles.logo}>
            <img 
              src={LOGO_URL}
              alt="Instagram"
              className={styles.logoImage}
            />
          </div>
          <div className={styles.successMessage}>
            Пароль успешно сброшен. Вы будете перенаправлены на страницу входа.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.formContainer}>
        <div className={styles.logo}>
          <img 
            src={LOGO_URL}
            alt="Instagram"
            className={styles.logoImage}
          />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              className={`${styles.input} ${error ? styles.error : ''}`}
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новый пароль"
              className={`${styles.input} ${error ? styles.error : ''}`}
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Подтвердите новый пароль"
              className={`${styles.input} ${error ? styles.error : ''}`}
            />
             {error && <div className={styles.errorMessage}>{error}</div>}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Сброс...' : 'Сбросить пароль'}
          </button>
        </form>
      </div>

      <div className={styles.alternativeAction}>
        <p>
          Вспомнили пароль?{' '}
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword; 