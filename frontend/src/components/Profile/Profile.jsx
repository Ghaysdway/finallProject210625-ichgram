import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactPlayer from 'react-player/lazy';
import {
  fetchUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
  fetchFollowers,
  fetchFollowing,
  clearFollowLists
} from '../../Redux/profileSlice';
import EditProfileModal from './EditProfileModal';
import styles from './Profile.module.css';
import { DEFAULT_AVATAR, API_URL, DEFAULT_POST_IMAGE } from '../../config/constants';
import PostModal from '../PostModal/PostModal';
import EditPostModal from '../EditPostModal/EditPostModal';
import FollowListModal from './FollowListModal/FollowListModal';






const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    profile,
    loading,
    error,
    followLoading,
    followersList,
    followersLoading,
    followersError,
    followingList,
    followingLoading,
    followingError
  } = useSelector(state => state.profile);
  const currentUser = useSelector(state => state.auth.user);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);


  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalTitle, setFollowModalTitle] = useState('');
  const [followModalUsers, setFollowModalUsers] = useState([]);
  const [followModalType, setFollowModalType] = useState('');

  useEffect(() => {
    if (!username && currentUser?.username) {
      navigate(`/profile/${currentUser.username}`);
      return;
    }

    if (username) {
      dispatch(fetchUserProfile(username));
    }
  }, [dispatch, username, currentUser, navigate]);

  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_AVATAR;
  }, []);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (formData) => {
    try {
      setUpdateError(null);
      

      console.log('Текущий пользователь:', currentUser);
      const userId = currentUser?._id || currentUser?.id;
      console.log('ID пользователя (исходный):', userId);
      console.log('Тип ID пользователя:', typeof userId);
      console.log('Данные формы:', formData);
      
      if (!userId) {
        throw new Error('ID пользователя не найден');
      }


      const userIdString = String(userId);
      console.log('ID пользователя (после преобразования):', userIdString);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }


      const sendData = new FormData();
      sendData.append('username', formData.username || '');
      sendData.append('email', formData.email || '');
      sendData.append('bio', formData.bio || '');
      sendData.append('fullName', formData.fullName || '');
      sendData.append('website', formData.website || '');
      sendData.append('phone', formData.phone || '');


      if (formData.avatar && formData.avatar instanceof File) {
        sendData.append('avatar', formData.avatar);
      }


      const response = await fetch(`${API_URL}/api/users/${userIdString}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`

        },
        body: sendData
      });

      const responseData = await response.json();
      console.log('Ответ сервера (полный):', responseData);
      console.log('Статус ответа:', response.status);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Ошибка обновления профиля');
      }

      await dispatch(fetchUserProfile(username));
      setShowEditModal(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setUpdateError(error.message);
    }
  };

  const isOwnProfile = currentUser && profile && (currentUser._id === profile._id || currentUser.id === profile.id);

  const handleEditRequest = (post) => {
    setSelectedPost(null);
    setPostToEdit(post);
  };

  const handleCloseEditModal = () => {
    setPostToEdit(null);
  };

  const handlePostSuccessfullyUpdated = (updatedPost) => {
    dispatch(fetchUserProfile(username));
    setPostToEdit(null);
  };


  const handlePostDeletedInProfile = (postId) => {








    dispatch(fetchUserProfile(username));
  };


  useEffect(() => {
    if (followModalType === 'followers') {
      setFollowModalUsers(followersList || []);
    } else if (followModalType === 'following') {
      setFollowModalUsers(followingList || []);
    }
  }, [followersList, followingList, followModalType]);

  const openFollowModal = async (type) => {
    if (!profile || !profile._id) return;

    setFollowModalType(type);
    setFollowModalTitle(type === 'followers' ? 'Подписчики' : 'Подписки');
    setIsFollowModalOpen(true);



    if (type === 'followers') {
      dispatch(fetchFollowers(profile._id));
    } else {
      dispatch(fetchFollowing(profile._id));
    }
  };

  const closeFollowModal = () => {
    setIsFollowModalOpen(false);
    setFollowModalTitle('');
    setFollowModalType('');
    setFollowModalUsers([]);
    dispatch(clearFollowLists());
  };

  const handleFollowToggleInModal = async (userIdToToggle, currentFollowStatus) => {
    console.log(`Toggling follow status for ${userIdToToggle}, current status: ${currentFollowStatus}`);
    
    try {
      if (currentFollowStatus) {
        await dispatch(unfollowUser(userIdToToggle)).unwrap();
      } else {
        await dispatch(followUser(userIdToToggle)).unwrap();
      }



      setFollowModalUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userIdToToggle ? { ...u, isFollowing: !currentFollowStatus } : u
        )
      );

      if (username) {
        dispatch(fetchUserProfile(username));
      }
    } catch (err) {
      console.error("Error toggling follow in modal:", err);

    }
  };


  const currentFollowModalLoading = followModalType === 'followers' ? followersLoading : followingLoading;
  const currentFollowModalError = followModalType === 'followers' ? followersError : followingError;

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.error}>
          {error}
          <button 
            onClick={() => dispatch(fetchUserProfile(username))}
            className={styles.retryButton}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.error}>
          Профиль не найден
          <button 
            onClick={() => dispatch(fetchUserProfile(username))}
            className={styles.retryButton}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <img
            src={profile.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `${API_URL}${profile.avatar}`) : DEFAULT_AVATAR}
            alt={profile.username}
            className={styles.avatar}
            onError={handleImageError}
          />
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.profileTopRow}>
            <h2 className={styles.username}>{profile.username}</h2>
            {isOwnProfile ? (
              <div className={styles.profileActions}>
                <button 
                  className={styles.editProfileButton}
                  onClick={handleEditProfile}
                >
                  Редактировать профиль
                </button>
              </div>
            ) : (
              <button
                className={`${styles.followButton} ${profile.isFollowing ? styles.unfollowButton : ''}`}
                onClick={async () => {
                  try {
                    if (profile.isFollowing) {
                      await dispatch(unfollowUser(profile.id)).unwrap();
                    } else {
                      await dispatch(followUser(profile.id)).unwrap();
                    }

                    if (username) {
                      dispatch(fetchUserProfile(username));
                    }
                  } catch (err) {


                    console.error('Failed to toggle follow state:', err);
                  }
                }}
                disabled={followLoading}
              >
                {followLoading ? 'Загрузка...' : (profile.isFollowing ? 'Отписаться' : 'Подписаться')}
              </button>
            )}
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{profile.postsCount || 0}</span> публикаций
            </div>
            <div className={styles.stat} onClick={() => openFollowModal('followers')}>
              <span className={styles.statValue}>{profile.followersCount || 0}</span> подписчиков
            </div>
            <div className={styles.stat} onClick={() => openFollowModal('following')}>
              <span className={styles.statValue}>{profile.followingCount || 0}</span> подписок
            </div>
          </div>

          <div className={styles.bioSection}>
            {profile.fullName && <div className={styles.fullName}>{profile.fullName}</div>}
            {profile.bio && <div className={styles.bio}>{profile.bio}</div>}
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                className={styles.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${styles.active}`}
          onClick={() => {}}
        >
          <div className={styles.tabIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M3 9h18M9 21V9"></path>
            </svg>
          </div>
          <span>Публикации</span>
        </button>
      </div>

      <div className={styles.postsGrid}>
        {isOwnProfile && (!profile.posts || profile.posts.length === 0) ? (
          <div className={styles.noPostsContainer}>
            <div className={styles.noPostsIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <h2 className={styles.noPostsTitle}>Поделитесь своим первым медиа</h2>
            <p className={styles.noPostsSubtitle}>Медиа, которыми вы поделитесь, появятся в вашем профиле.</p>
            <button 
              className={styles.shareFirstPhotoButton}
              onClick={() => navigate('/create-post')}
            >
              Поделиться первым медиа
            </button>
          </div>
        ) : profile.posts && profile.posts.length > 0 ? (
          profile.posts.map(post => {
            const postImageSrc = (post.mediaType === 'image' || (!post.mediaType && post.imageUrl)) && post.imageUrl
              ? post.imageUrl.startsWith('http') ? post.imageUrl : `${API_URL}${post.imageUrl}`
              : DEFAULT_POST_IMAGE;
            
            const safeLikesCount = post.likes?.length || 0;
            

            const commentsLength = post.commentsCount !== undefined ? post.commentsCount : (post.comments?.length || 0);

            const isLiked = currentUser && post.likes && post.likes.some(like => {
              if (typeof like === 'string') return like === currentUser._id;
              if (like && like.user && typeof like.user === 'string') return like.user === currentUser._id;
              if (like && like.user && typeof like.user === 'object' && like.user._id) return like.user._id === currentUser._id;
              if (like && like._id && typeof like._id === 'string') return like._id === currentUser._id;
              return false;
            });

            return (
              <div key={post._id} className={styles.postItem} onClick={() => setSelectedPost(post)}>
                {(post.mediaType === 'image' || (!post.mediaType && post.imageUrl)) && post.imageUrl ? (
                  <>
                    <img 
                      src={postImageSrc} 
                      alt={post.content || 'Post'} 
                      className={styles.postImage} 
                      onError={(e) => { e.target.src = DEFAULT_POST_IMAGE; }}
                    />
                    <div className={styles.postOverlay}>
                      <div className={styles.postStats}>
                        <span className={isLiked ? styles.liked : ''}>
                          {}
                          🤍 {safeLikesCount}
                        </span>
                        <span>
                          {}
                          💬 {commentsLength}
                        </span>
                      </div>
                    </div>
                  </>
                ) : post.mediaType === 'video' && post.videoUrl ? (
                  <>
                    {post.videoUrl.startsWith('http') ? (
                      <div className={styles.videoPreviewContainer}>
                        <ReactPlayer
                          url={post.videoUrl}
                          className={styles.videoPreviewPlayer}
                          light={true}
                          controls={false}
                          onError={(e) => console.error('ReactPlayer error in Profile (external):', e, post.videoUrl)}
                        />
                        <div className={styles.playIconOverlay}>
                          <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.videoPreviewContainer}>
                        <video
                          src={`${API_URL}${post.videoUrl}`}
                          className={styles.videoElementPreview}
                          preload="metadata"
                          muted
                          playsInline 
                          onError={(e) => console.error('HTML <video> error in Profile (local):', e, `${API_URL}${post.videoUrl}`)}
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className={styles.playIconOverlay}>
                          <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {}
                    <div className={styles.postOverlay}>
                      <div className={styles.postStats}>
                        <span className={isLiked ? styles.liked : ''}>
                          🤍 {safeLikesCount}
                        </span>
                        <span>
                          💬 {commentsLength}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (

                  <>
                    <img
                      src={DEFAULT_POST_IMAGE}
                      alt="Post media"
                      className={styles.postImage}
                      onError={(e) => { e.target.src = DEFAULT_POST_IMAGE; }}
                    />
                    {}
                    <div className={styles.postOverlay}>
                      <div className={styles.postStats}>
                        <span className={isLiked ? styles.liked : ''}>
                          🤍 {safeLikesCount}
                        </span>
                        <span>
                          💬 {commentsLength}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.noPosts}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M3 15l6-6 4 4 2-2 4 4"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
            </svg>
            <p>Нет публикаций</p>
          </div>
        )}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={(updatedPostData) => {
            setSelectedPost(prev => ({...prev, ...updatedPostData}));
            dispatch(fetchUserProfile(username));
          }}
          onEditRequest={handleEditRequest}
          onPostDeleted={handlePostDeletedInProfile}
        />
      )}

      {postToEdit && (
        <EditPostModal
          post={postToEdit}
          onClose={handleCloseEditModal}
          onPostUpdated={handlePostSuccessfullyUpdated}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {updateError && (
        <div className={styles.updateError}>
          {updateError}
        </div>
      )}

      <FollowListModal 
        isOpen={isFollowModalOpen}
        onClose={closeFollowModal}
        title={followModalTitle}
        users={followModalUsers}
        currentUserId={currentUser?._id}
        onFollowToggle={handleFollowToggleInModal}
        isLoading={currentFollowModalLoading}
        error={currentFollowModalError}
      />
    </div>
  );
};

export default Profile;