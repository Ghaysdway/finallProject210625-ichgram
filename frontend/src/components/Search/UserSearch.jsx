import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserSearch.module.css';
import defaultAvatar from '../../assets/bird.png';

const UserSearch = ({ isOpen, onClose, inline }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.matchMedia('(max-width: 391px)').matches);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    if (!inline && !isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
      setMessage('');
      setLoading(false);
    }
  }, [isOpen, inline]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const fetchUsers = async (searchQuery) => {
    if ((!inline && !isOpen) || !searchQuery.trim()) {
      setResults([]);
      setMessage('');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        setError('Аутентификация не пройдена. Пожалуйста, войдите в систему.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setResults(data.items);
        setMessage('');
      } else {
        setResults([]);
        setMessage('Пользователи не найдены.');
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), [isOpen, inline]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchUsers(value);
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    if (onClose) onClose();
  };

  if (!inline && !isOpen) {
    return null;
  }

  if (inline) {
    return (
      <div className={styles.inlineSearchContainer}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Поиск пользователей..."
          className={styles.searchInput}
        />
        {loading && <p className={styles.loadingMessage}>Загрузка...</p>}
        {error && <p className={styles.errorMessage}>Ошибка: {error}</p>}
        {message && !loading && !error && results.length === 0 && <p className={styles.infoMessage}>{message}</p>}
        {results.length > 0 && (
          <ul className={styles.resultsList}>
            {results.map((user) => (
              <li 
                key={user._id} 
                className={styles.resultItem}
                onClick={() => handleUserClick(user.username)}
              >
                <img 
                  src={user.avatar ? user.avatar : defaultAvatar}
                  alt={user.username} 
                  className={styles.avatar} 
                />
                <div className={styles.userInfo}>
                  <span className={styles.username}>{user.username}</span>
                  {user.fullName && <span className={styles.fullName}>{user.fullName}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={styles.searchPanelOverlay} onClick={onClose}>
      <div className={styles.searchPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <h2>Поиск</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.searchInputContainer}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Поиск пользователей..."
            className={styles.searchInput}
            autoFocus
          />
        </div>
        {loading && <p className={styles.loadingMessage}>Загрузка...</p>}
        {error && <p className={styles.errorMessage}>Ошибка: {error}</p>}
        {message && !loading && !error && results.length === 0 && <p className={styles.infoMessage}>{message}</p>}
        {results.length > 0 && (
          <ul className={styles.resultsList}>
            {results.map((user) => (
              <li 
                key={user._id} 
                className={styles.resultItem}
                onClick={() => handleUserClick(user.username)}
              >
                <img 
                  src={user.avatar ? user.avatar : defaultAvatar}
                  alt={user.username} 
                  className={styles.avatar} 
                />
                <div className={styles.userInfo}>
                  <span className={styles.username}>{user.username}</span>
                  {user.fullName && <span className={styles.fullName}>{user.fullName}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserSearch; 