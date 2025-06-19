import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markSingleNotificationReadThunk } from '../../Redux/notificationSlice';
import styles from './Notifications.module.css';
import { Link } from 'react-router-dom';
import { API_URL, DEFAULT_AVATAR, DEFAULT_POST_IMAGE } from '../../config/constants';
import PostModal from '../PostModal/PostModal';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds}с назад`;
  if (minutes < 60) return `${minutes}м назад`;
  if (hours < 24) return `${hours}ч назад`;
  return `${days}д назад`;
};

const NotificationItem = ({ notification, onNotificationClick }) => {
  const { _id, sender, type, post, createdAt, read } = notification;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!sender) {
    console.warn('Notification item missing sender:', notification);
    return null;
  }

  let actionText = '';
  let primaryLinkPath = `/profile/${sender.username}`;
  let postPreviewSrc = null;

  const senderAvatarSrc = sender.avatar
    ? (sender.avatar.startsWith('http') ? sender.avatar : `${API_URL}${sender.avatar}`)
    : DEFAULT_AVATAR;

  if ((type === 'like' || type === 'comment') && post) {
    actionText = type === 'like' ? 'лайкнул ваш пост.' : 'прокомментировал ваш пост.';
    primaryLinkPath = `/post/${post._id}`;
    if (post.imageUrl) {
      postPreviewSrc = post.imageUrl.startsWith('http') ? post.imageUrl : `${API_URL}${post.imageUrl}`;
    } else if (post.videoUrl && post.mediaType === 'video') {
      postPreviewSrc = DEFAULT_POST_IMAGE; 
    }
  } else if (type === 'follow') {
    actionText = 'начал отслеживать вас.';
  }

  const handleItemClick = async () => {
    if (!read) {
      try {
        dispatch(markSingleNotificationReadThunk(_id));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    if ((type === 'like' || type === 'comment') && post) {
      onNotificationClick({ type: 'post', id: post._id, postData: post });
    } else if (type === 'follow') {
      navigate(primaryLinkPath);
    }
  };

  return (
    <div
      className={`${styles.notificationItem} ${read ? styles.read : ''}`}
      onClick={handleItemClick}
    >
      <Link to={`/profile/${sender.username}`} className={styles.avatarLink} onClick={(e) => e.stopPropagation()}> 
        <img
          src={senderAvatarSrc}
          alt={sender.username}
          className={styles.senderAvatar}
          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
        />
      </Link>
      <div className={styles.notificationContent}>
        <p className={styles.notificationText}>
          <Link to={`/profile/${sender.username}`} className={styles.senderUsername} onClick={(e) => e.stopPropagation()}>
            {sender.username}
          </Link>
          <span className={styles.actionText}> {actionText}</span>
        </p>
        <span className={styles.notificationTime}>{formatTimeAgo(createdAt)}</span>
      </div>
      {postPreviewSrc && (type === 'like' || type === 'comment') && (
         <div className={styles.postThumbnailContainer}>
            <img src={postPreviewSrc} alt="Post preview" className={styles.postThumbnail} />
         </div>
      )}
      {!postPreviewSrc && (type === 'like' || type === 'comment') && post && (
        <div className={`${styles.postThumbnailContainer} ${styles.postThumbnailPlaceholder}`}></div>
      )}
    </div>
  );
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { items, loading, error, unreadCount } = useSelector((state) => state.notifications);
  const currentUser = useSelector((state) => state.auth.user);
  const [selectedPostForModal, setSelectedPostForModal] = useState(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  
  console.log('[Notifications.jsx] Raw items from Redux:', items);

  const handleNotificationInteraction = (interactionData) => {
    if (interactionData.type === 'post' && interactionData.postData) {
        setSelectedPostForModal(interactionData.postData);
    } 
  };

  const handlePostModalClose = () => {
    setSelectedPostForModal(null);
  };

  const handlePostUpdatedInModal = (updatedPost) => {
    setSelectedPostForModal(null);
    dispatch(fetchNotifications());
  };

  const handlePostDeletedInModal = (postId) => {
    setSelectedPostForModal(null);
    dispatch(fetchNotifications());
  };

  if (loading) {
    return <div className={styles.notificationsContainer}><p>Загрузка уведомлений...</p></div>;
  }

  if (error) {
    return <div className={styles.notificationsContainer}><p>Ошибка: {error}</p></div>;
  }

  return (
    <div className={styles.notificationsContainer}>
      <h1 className={styles.notificationsTitle}>Уведомления</h1>
      {items.length === 0 ? (
        <p>У вас пока нет уведомлений.</p>
      ) : (
        <div className={styles.notificationsList}>
          {items.map((notification) => {
            console.log('[Notifications.jsx] Processing notification for NotificationItem:', notification);
            return (
              <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                  onNotificationClick={handleNotificationInteraction}
              />
            );
          })}
        </div>
      )}
      {selectedPostForModal && currentUser && (
        <PostModal 
          post={selectedPostForModal} 
          currentUser={currentUser}
          onClose={handlePostModalClose}
          onPostUpdated={handlePostUpdatedInModal}
          onPostDeleted={handlePostDeletedInModal}
        />
      )}
    </div>
  );
};

export default Notifications; 