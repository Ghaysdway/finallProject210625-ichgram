import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/lazy';
import { 
  fetchFeedPosts,
  likePost, 
  addComment, 
  addPostToFavorites,
  removePostFromFavorites
} from '../../Redux/postSlice';
import { API_URL, DEFAULT_AVATAR, DEFAULT_POST_IMAGE } from '../../config/constants';
import styles from './Feed.module.css';
import PostModal from '../PostModal/PostModal';
import EmojiPicker from 'emoji-picker-react';
import UserSearch from '../Search/UserSearch';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30.44);
  const years = Math.round(days / 365.25);

  if (seconds < 5) return 'сейчас';
  if (seconds < 60) return `${seconds}с`;
  if (minutes < 60) return `${minutes}м`;
  if (hours < 24) return `${hours}ч`;
  if (days === 1) return 'вчера';
  if (days < 7) return `${days}д`;
  if (weeks < 5) return `${weeks}н`;
  if (months < 12) return new Intl.DateTimeFormat('ru', { month: 'short', day: 'numeric' }).format(date);
  return new Intl.DateTimeFormat('ru', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector(state => state.posts);
  const currentUser = useSelector(state => state.auth.user);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);
  const [newCommentTexts, setNewCommentTexts] = useState({});
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);
  const inputRefs = useRef({});
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    dispatch(fetchFeedPosts());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.emoji-picker-container') && 
          !event.target.closest('.emoji-button')) {
        setActiveEmojiPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkWidth = () => {
      setShowMobileSearch(window.matchMedia('(max-width: 391px)').matches);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handlePostUpdate = (updatedPost) => {
    dispatch(fetchFeedPosts());
    if (selectedPost && selectedPost._id === updatedPost._id) {
        setSelectedPost(prev => ({...prev, ...updatedPost}));
    }
  };
  
  const handlePostDeleted = (postId) => {
    dispatch(fetchFeedPosts());
    if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(null);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      console.log("User not logged in. Cannot like post.");
      return;
    }
    try {
      const updatedPost = await dispatch(likePost(postId)).unwrap();
      if (selectedPost && selectedPost._id === updatedPost._id) {
        setSelectedPost(updatedPost);
      }
    } catch (error) {
      console.error('Error liking post in Feed:', error);
    }
  };
  
  const handleEditRequest = (post) => {
    setSelectedPost(null);
    setPostToEdit(post);
  };

  const handleCommentInputChange = (postId, text) => {
    setNewCommentTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const handleAddComment = async (postId) => {
    if (!currentUser) {
      console.log("User not logged in. Cannot add comment.");
      return;
    }
    const commentContent = newCommentTexts[postId];
    if (!commentContent || commentContent.trim() === '') {
      console.log("Comment cannot be empty.");
      return;
    }

    try {
      await dispatch(addComment({ postId, content: commentContent.trim() })).unwrap();
      setNewCommentTexts(prev => ({
        ...prev,
        [postId]: ''
      }));
      if (selectedPost && selectedPost._id === postId) {
      }
    } catch (err) {
      console.error("Failed to add comment from feed:", err);
    }
  };

  const handleToggleFavorite = (postId, isCurrentlyFavorite) => {
    if (!currentUser) {
      console.log("User not logged in. Cannot toggle favorite.");
      return;
    }
    try {
      if (isCurrentlyFavorite) {
        dispatch(removePostFromFavorites(postId));
      } else {
        dispatch(addPostToFavorites(postId));
      }
    } catch (error) {
      console.error('Error toggling favorite in Feed:', error);
    }
  };

  const handleEmojiButtonClick = (postId, e) => {
    console.log('Emoji button clicked for post:', postId);
    console.log('Current activeEmojiPicker:', activeEmojiPicker);
    e.preventDefault();
    e.stopPropagation();
    setActiveEmojiPicker(prev => prev === postId ? null : postId);
  };

  const handleEmojiClick = (postId, emojiData) => {
    const input = inputRefs.current[postId];
    if (!input) return;
    
    const cursorPos = input.selectionStart;
    const text = newCommentTexts[postId] || '';
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);
    const newText = before + emojiData.emoji + after;
    
    handleCommentInputChange(postId, newText);
    setActiveEmojiPicker(null);
    
    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = cursorPos + emojiData.emoji.length;
    }, 0);
  };

  const renderPost = (post) => {
    const postTimeAgo = formatTimeAgo(post.createdAt);
    const postMediaSrc = post.mediaType === 'video' && post.videoUrl
      ? (post.videoUrl.startsWith('http') ? post.videoUrl : `${API_URL}${post.videoUrl}`)
      : (post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${API_URL}${post.imageUrl}`) : DEFAULT_POST_IMAGE);
    
    const authorAvatarSrc = post.author?.avatar
      ? (post.author.avatar.startsWith('http') ? post.author.avatar : `${API_URL}${post.author.avatar}`)
      : DEFAULT_AVATAR;
    
    const isLikedByCurrentUser = post.likes?.some(like => {
      if (!currentUser || !like) return false;
      if (typeof like === 'string') return like === currentUser._id;
      if (like._id && typeof like._id === 'string') return like._id === currentUser._id;
      if (like.user && typeof like.user === 'string') return like.user === currentUser._id;
      if (like.user && typeof like.user === 'object' && like.user._id) return like.user._id === currentUser._id;
      return false;
    });

    const isFavorite = post.isFavorite;
    const currentCommentText = newCommentTexts[post._id] || '';

    return (
      <article key={post._id} className={styles.postCard}>
        <header className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <Link to={`/profile/${post.author.username}`} className={styles.usernameLink}>
              <img
                src={authorAvatarSrc}
                alt={post.author.username}
                className={styles.authorAvatar}
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
            </Link>
            <Link to={`/profile/${post.author.username}`} className={styles.usernameLink}>
              <span className={styles.authorUsername}>{post.author.username}</span>
            </Link>
          </div>
          <div className={styles.postHeaderMeta}>
            <span className={styles.dotSeparator}>•</span>
            <span className={styles.timeAgo}>{postTimeAgo}</span>
          </div>
        </header>
        
        <div 
          className={styles.postMediaContainer}
          onDoubleClick={() => handleLike(post._id)}
          onClick={() => setSelectedPost(post)}
        >
          {(post.mediaType === 'image' || !post.mediaType) && post.imageUrl && (
            <img
              src={postMediaSrc}
              alt={post.content || 'Post image'}
              className={styles.postImage}
              onError={(e) => {
                console.error('Error loading image in Feed:', postMediaSrc);
                e.target.src = DEFAULT_POST_IMAGE;
              }}
            />
          )}
          {post.mediaType === 'video' && post.videoUrl && (
            post.videoUrl.startsWith('http') ? (
              <div className={styles.videoPlayerContainer}>
                <ReactPlayer
                  url={post.videoUrl}
                  className={styles.reactPlayer}
                  controls={true}
                  light={true}
                  onError={(e) => console.error('ReactPlayer error in Feed:', e, post.videoUrl)}
                />
              </div>
            ) : (
              <video
                src={postMediaSrc}
                controls
                className={styles.postVideo}
                onError={(e) => {
                  console.error('Error loading uploaded video in Feed:', postMediaSrc);
                }}
              >Ваш браузер не поддерживает тег video.</video>
            )
          )}
        </div>

        <footer className={styles.postFooter}>
          <div className={styles.postActions}>
            <button 
              onClick={() => handleLike(post._id)} 
              className={`${styles.actionButton} ${isLikedByCurrentUser ? styles.liked : ''}`}
              aria-label={isLikedByCurrentUser ? "Unlike" : "Like"}
            >
              {isLikedByCurrentUser ? (
                <svg aria-label="Unlike" fill="#ed4956" height="24" role="img" viewBox="0 0 48 48" width="24"><path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path></svg>
              ) : (
                <svg aria-label="Like" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.763a4.111 4.111 0 0 1 3.675-1.941z"></path></svg>
              )}
            </button>
            <button onClick={() => setSelectedPost(post)} className={styles.actionButton} aria-label="Comment">
              <svg aria-label="Comment" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
            <button 
              onClick={() => handleToggleFavorite(post._id, isFavorite)} 
              className={styles.actionButton} 
              aria-label={isFavorite ? "Удалить из сохраненного" : "Сохранить"}
            >
              {isFavorite ? (
                <svg aria-label="Удалить из сохраненного" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path></svg>
              ) : (
                <svg aria-label="Сохранить" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
              )}
            </button>
          </div>
          {(post.likes?.length || 0) > 0 && (
            <div className={styles.likesCount}>
              {post.likes.length} отметок "Нравится"
            </div>
          )}
          <div className={styles.postCaption}>
            <Link to={`/profile/${post.author.username}`} className={styles.usernameLink}>
              <span className={styles.authorUsername}>{post.author.username}</span>
            </Link>
            <span className={styles.captionText}> {post.content}</span>
          </div>

          {post.comments && post.comments.length > 0 && (
            <div className={styles.commentsPreviewContainer}>
              {post.comments.slice(-1).map(comment => (
                <div key={comment._id || Math.random()} className={styles.commentPreviewItem}>
                  <Link to={`/profile/${comment.author?.username}`} className={styles.usernameLink}>
                    <span className={styles.authorUsername}>{comment.author?.username}</span>
                  </Link>
                  <span className={styles.commentTextPreview}> {comment.content}</span>
                </div>
              ))}
              {post.comments.length > 1 && (
                <button onClick={() => setSelectedPost(post)} className={styles.viewAllComments}>
                  Смотреть все комментарии ({post.comments.length})
                </button>
              )}
            </div>
          )}
          
          <form className={styles.addCommentForm} onSubmit={(e) => { 
            e.preventDefault(); 
            handleAddComment(post._id); 
          }}>
            <input
              type="text"
              className={styles.addCommentInput}
              placeholder="Добавьте комментарий..."
              value={currentCommentText} 
              onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
              ref={el => inputRefs.current[post._id] = el}
            />
            <div className={styles.emojiButtonContainer}>
              <button
                type="button"
                className={`${styles.emojiButton} emoji-button`}
                onClick={(e) => handleEmojiButtonClick(post._id, e)}
                aria-label="Добавить эмодзи"
              >
                😊
              </button>
              {activeEmojiPicker === post._id && (
                <div className={`${styles.emojiPickerContainer} emoji-picker-container`}>
                  <EmojiPicker
                    onEmojiClick={(emojiData) => handleEmojiClick(post._id, emojiData)}
                    autoFocusSearch={false}
                    height={350}
                    width={300}
                  />
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className={styles.addCommentButton} 
              disabled={!currentCommentText.trim()}
            >
              Опубликовать
            </button>
          </form>
          <div className={styles.postTimestamp}>{postTimeAgo}</div>
        </footer>
      </article>
    );
  };

  if (loading) {
    return (
      <div className={styles.feedLoading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.feedError}>
        <p>{typeof error === 'string' ? error : JSON.stringify(error)}</p>
        <button onClick={() => dispatch(fetchFeedPosts())} className={styles.retryButton}>Попробовать снова</button>
      </div>
    );
  }
  
  if (!posts || posts.length === 0) {
    return (
      <div className={styles.noPosts}>
        <p>Пока нет постов. Начните следить за кем-нибудь или создайте свой первый пост!</p>
      </div>
    );
  }

  return (
    <div className={styles.feedContainer}>
      {showMobileSearch && (
        <div className="mobile-user-search-bar">
          <UserSearch inline />
        </div>
      )}
      <div className={styles.postsContainer}>
        {posts.map(post => renderPost(post))}
      </div>
      {selectedPost && (
        <PostModal
          post={selectedPost}
          currentUser={currentUser}
          onClose={() => setSelectedPost(null)}
          onPostUpdated={handlePostUpdate}
          onPostDeleted={handlePostDeleted}
          onEditRequest={handleEditRequest}
          isFavorite={selectedPost.isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {postToEdit && (
        <PostModal
          post={postToEdit}
          onClose={() => setPostToEdit(null)}
          currentUser={currentUser}
          onPostUpdate={handlePostUpdate}
          onPostDeleted={handlePostDeleted}
          onEditRequest={handleEditRequest}
          isEditingDefault={true}
          isFavorite={postToEdit.isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default React.memo(Feed); 