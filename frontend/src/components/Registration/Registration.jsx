import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../Redux/authSlice';
import styles from '../Auth/AuthForm.module.css';
import { LOGO_URL, API_URL } from '../../config/constants';
import backgroundImg from '../../assets/Background.png';

const Registration = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.username) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно быть не менее 3 символов';
    }

    if (!formData.phone) {
      newErrors.phone = 'Номер телефона обязателен';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDirectRegistration = async () => {
    try {
      setDebugInfo('Отправка прямого запроса на регистрацию...');
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          phone: formData.phone
        })
      });

      const responseText = await response.text();
      setDebugInfo(prev => prev + '\nПолучен ответ: ' + responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setDebugInfo(prev => prev + '\nОшибка парсинга JSON: ' + e.message);
        throw new Error('Ошибка при обработке ответа сервера');
      }

      if (response.ok && data.token) {
        setDebugInfo(prev => prev + '\nУспешная регистрация! Токен получен.');
        localStorage.setItem('token', data.token);
        navigate('/feed');
      } else {
        const errorMessage = data.message || 'Неизвестная ошибка при регистрации';
        setDebugInfo(prev => prev + '\nОшибка: ' + errorMessage);
        

        if (errorMessage.includes('email')) {
          setErrors(prev => ({ ...prev, email: errorMessage }));
        } else if (errorMessage.includes('имен')) {
          setErrors(prev => ({ ...prev, username: errorMessage }));
        } else if (errorMessage.includes('телефон')) {
          setErrors(prev => ({ ...prev, phone: errorMessage }));
        } else {
          setErrors(prev => ({ ...prev, submit: errorMessage }));
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      setDebugInfo(prev => prev + '\nОшибка запроса: ' + error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setDebugInfo(null);
    setErrors({});

    try {
      await handleDirectRegistration();
    } catch (error) {
      console.error('Registration error:', error);
      if (!errors.email && !errors.username && !errors.phone) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Произошла ошибка при регистрации'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className={styles.authContainer}>
      <div className={styles.imageBox}>
        <img src={backgroundImg} alt="Preview" className={styles.imagePreview} />
      </div>
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
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              disabled={isLoading}
            />
            {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={handleChange}
              className={`${styles.input} ${errors.username ? styles.error : ''}`}
              disabled={isLoading}
            />
            {errors.username && <div className={styles.errorMessage}>{errors.username}</div>}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              name="phone"
              placeholder="Номер телефона"
              value={formData.phone}
              onChange={handleChange}
              className={`${styles.input} ${errors.phone ? styles.error : ''}`}
              disabled={isLoading}
            />
            {errors.phone && <div className={styles.errorMessage}>{errors.phone}</div>}
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.error : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                className={styles.showPasswordButton}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordInput}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className={styles.showPasswordButton}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <div className={styles.errorMessage}>{errors.confirmPassword}</div>}
          </div>

          {errors.submit && <div className={styles.errorMessage}>{errors.submit}</div>}
          
          {debugInfo && (
            <div className={styles.debugInfo}>
              <pre>{debugInfo}</pre>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className={styles.alternativeAction}>
        <p>
          Есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
      </div>

      
    </div>
    
  );
};

export default Registration; 