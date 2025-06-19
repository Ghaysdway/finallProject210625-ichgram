import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearResetPasswordState } from '../../Redux/resetPasswordSlice';
import styles from '../Auth/AuthForm.module.css';
import { LOGO_URL } from '../../config/constants';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(state => state.resetPassword);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    dispatch(clearResetPasswordState());
    return () => {
      dispatch(clearResetPasswordState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setValidationError('Пароль должен содержать минимум 6 символов');
      return;
    }

    dispatch(resetPassword({ token, password }));
  };

  if (success) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.formContainer}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h2>Пароль успешно изменен!</h2>
            <p>Сейчас вы будете перенаправлены на страницу входа...</p>
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

        <h2 className={styles.formTitle}>Создание нового пароля</h2>
        <p className={styles.formDescription}>
          Придумайте новый надежный пароль для вашего аккаунта
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {(validationError || error) && (
            <div className={styles.errorMessage}>
              {validationError || error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Новый пароль"
              className={styles.input}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Подтвердите новый пароль"
              className={styles.input}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
          </button>
        </form>

        <div className={styles.alternativeAction}>
          <Link to="/login" className={styles.link}>
            Вернуться к входу
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 