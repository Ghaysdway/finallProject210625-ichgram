import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './FollowListModal.module.css';
import { DEFAULT_AVATAR } from '../../../config/constants'; 




const UserItem = ({ user, currentUserId, onFollowToggle, onCloseModal }) => {
  const handleUserClick = () => {
    onCloseModal(); 
  };

  return (
    <div className={styles.userItem}>
      <Link to={`/profile/${user.username}`} className={styles.userInfoLink} onClick={handleUserClick}>
        <img 
          src={user.avatar || DEFAULT_AVATAR} 
          alt={user.username} 
          className={styles.userAvatar}
        />
        <div className={styles.userDetails}>
          <span className={styles.username}>{user.username}</span>
          {user.fullName && <span className={styles.fullName}>{user.fullName}</span>}
        </div>
      </Link>
      {currentUserId && user._id !== currentUserId && (
        <button 
          className={`${styles.followButton} ${user.isFollowing ? styles.unfollowButton : styles.followingButton}`}
          onClick={() => onFollowToggle(user._id, user.isFollowing)}
        >
          {user.isFollowing ? 'Отписаться' : 'Подписаться'}
        </button>
      )}
       {}
    </div>
  );
};

const FollowListModal = ({ 
  isOpen, 
  onClose, 
  title, 
  users = [], 
  currentUserId, 
  onFollowToggle, 
  isLoading, 
  error 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {

    if (searchTerm === '') {
      setFilteredUsers(users || []);
    } else {
      setFilteredUsers(
        (users || []).filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [searchTerm, users]); 

  if (!isOpen) {
    return null;
  }

  let listContent;
  if (isLoading) {
    listContent = <p className={styles.loadingText}>Загрузка списка...</p>;
  } else if (error) {
    listContent = <p className={styles.errorText}>Ошибка: {typeof error === 'string' ? error : error.message || 'Не удалось загрузить список.'}</p>;
  } else if (filteredUsers.length > 0) {
    listContent = filteredUsers.map(user => (
      <UserItem 
        key={user._id} 
        user={user} 
        currentUserId={currentUserId} 
        onFollowToggle={onFollowToggle}
        onCloseModal={onClose}
      />
    ));
  } else {
    listContent = (
      <p className={styles.noUsersText}>
        {searchTerm ? 'Пользователи не найдены.' : (title === 'Подписчики' ? 'Нет подписчиков.' : 'Нет подписок.')}
      </p>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        {!isLoading && !error && (
          <div className={styles.searchInputContainer}>
            <input 
              type="text"
              placeholder="Поиск"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || !!error} 
            />
          </div>
        )}
        <div className={styles.userList}>
          {listContent}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal; 