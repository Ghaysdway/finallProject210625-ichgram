import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactPlayer from 'react-player/lazy';
import { likePost, deletePost, addComment } from '../../Redux/postSlice';
import { API_URL, DEFAULT_AVATAR, DEFAULT_POST_IMAGE } from '../../config/constants';
import styles from './PostModal.module.css';
import { Link } from 'react-router-dom';
import { followUser, unfollowUser } from '../../Redux/profileSlice';
import EmojiPicker from 'emoji-picker-react';

const PostModal = ({ post: initialPost, onClose, onUpdate, onEditRequest, onPostDeleted, isFavorite: initialIsFavorite, onToggleFavorite }) => {
  const [post, setPost] = useState(initialPost);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(!!post.author?.isFollowing);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  const globalPostState = useSelector(state => 
    state.posts.posts.find(p => p._id === initialPost?._id)
  );
  const globalIsFavorite = useSelector(state => 
    state.posts.posts.find(p => p._id === initialPost?._id)?.isFavorite
  );
  const { likeLoading, loading: postActionLoading, error: postActionError } = useSelector(state => state.posts);

  useEffect(() => {
    const currentPostData = globalPostState || initialPost;
    setPost(currentPostData); 
    if (globalPostState) {
      setIsFavorite(globalPostState.isFavorite);
    } else if (initialPost) {
      setIsFavorite(initialIsFavorite);
    }
  }, [initialPost, globalPostState, initialIsFavorite]);

  useEffect(() => {
    setIsFollowing(!!post.author?.isFollowing);
  }, [post.author?.isFollowing, post.author?._id]);

  if (!post) return null;


  console.log('[PostModal] Received post:', JSON.parse(JSON.stringify(post)));
  console.log('[PostModal] post.mediaType:', post.mediaType);
  console.log('[PostModal] post.videoUrl:', post.videoUrl);
  let videoSrcForNativePlayer = null;
  if (post.mediaType === 'video' && post.videoUrl && !post.videoUrl.startsWith('http')) {
    try {
      videoSrcForNativePlayer = new URL(post.videoUrl, API_URL).href;
      console.log('[PostModal] Calculated videoSrc for native player:', videoSrcForNativePlayer);
    } catch (e) {
      console.error('[PostModal] Error constructing URL for video:', e);
      console.error('[PostModal] post.videoUrl was:', post.videoUrl);
      console.error('[PostModal] API_URL was:', API_URL);
    }
  }

  const isLikedByCurrentUser = post.likes?.some(like => {
    if (!currentUser || !like) return false;

    if (typeof like === 'string') return like === currentUser._id;

    if (like._id && typeof like._id === 'string') return like._id === currentUser._id;

    if (like.user && typeof like.user === 'string') return like.user === currentUser._id;

    if (like.user && typeof like.user === 'object' && like.user._id) return like.user._id === currentUser._id;
    return false;
  });

  const handleLike = async () => {
    if (likeLoading || !post?._id) return;
    try {
      const updatedPostData = await dispatch(likePost(post._id)).unwrap();
      setPost(updatedPostData); 
      if (onUpdate) {
        onUpdate(updatedPostData);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleEdit = () => {
    if (onEditRequest) {
      onEditRequest(post);
    }
    setShowOptionsMenu(false);
  };

  const handleAttemptDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      handleConfirmDelete();
    }
  };

  const handleConfirmDelete = async () => {
    if (!post || !post._id || postActionLoading) return;
    try {
      await dispatch(deletePost(post._id)).unwrap();
      setShowOptionsMenu(false);
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert('Link copied to clipboard!');
      setShowOptionsMenu(false);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      alert('Failed to copy link.');
    });
  };

  const handleEmojiClick = (emojiData) => {
    const input = inputRef.current;
    if (!input) return;
    const cursorPos = input.selectionStart;
    const text = newComment || '';
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);
    const newText = before + emojiData.emoji + after;
    setNewComment(newText);
    setShowEmojiPicker(false);
    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = cursorPos + emojiData.emoji.length;
    }, 0);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !post?._id || postActionLoading) return;
    try {
      await dispatch(addComment({ postId: post._id, content: newComment })).unwrap();
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderComments = () => {
    if (!post.comments || post.comments.length === 0) {
      return <p className={styles.noComments}>Комментариев пока нет.</p>;
    }
    return post.comments.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, index) => {
      const key = comment && comment._id ? comment._id : `comment-${index}`;
      if (!(comment && comment._id)) {
        console.warn('Comment object or comment._id is missing. Using index as fallback key. Comment:', comment);
      }
      return (
      <div key={key} className={styles.commentItem}>
        <img 
          src={comment?.author?.avatar ? (comment.author.avatar.startsWith('http') ? comment.author.avatar : `${API_URL}${comment.author.avatar}`) : DEFAULT_AVATAR} 
          alt={comment?.author?.username || 'User'}
          className={styles.commentAuthorAvatar}
        />
        <div className={styles.commentContent}>
          <span className={styles.commentAuthorUsername}>{comment?.author?.username || 'Anonymous'}</span>
          <span className={styles.commentText}>{comment?.content}</span>
        </div>
      </div>
    )});
  };

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      onToggleFavorite(post._id, isFavorite);
    }
  };

  const handleFollowToggle = async () => {
    if (!post.author?._id || followLoading || (currentUser && post.author._id === currentUser._id)) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(post.author._id)).unwrap();
        setIsFollowing(false);
      } else {
        await dispatch(followUser(post.author._id)).unwrap();
        setIsFollowing(true);
      }
    } catch (e) {
      if (e?.message?.includes('Already following')) {
        setIsFollowing(true);
      }

    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalGrid}>
          <div className={styles.mediaSection}>
            {(post.mediaType === 'image' || !post.mediaType) && post.imageUrl && (
              <img 
                src={post.imageUrl.startsWith('http') ? post.imageUrl : new URL(post.imageUrl, API_URL).href}
                alt={post.content || 'Post image'}
                className={styles.postMedia}
                onError={(e) => {
                  console.error('Error loading image:', e.target.src);
                  e.target.src = DEFAULT_POST_IMAGE;
                }}
              />
            )}
            {post.mediaType === 'video' && post.videoUrl && (
              <div className={styles.videoPlayerContainer}>
                {post.videoUrl.startsWith('http') ? (
                  <ReactPlayer
                    url={post.videoUrl}
                    className={styles.reactPlayer}
                    controls={true}
                    playing={true}
                    onError={(e) => console.error('ReactPlayer error:', e, post.videoUrl)}
                  />
                ) : (
                  <video
                    src={videoSrcForNativePlayer}
                    controls
                    className={styles.postMedia}
                    onError={(e) => {
                      console.error('Error loading uploaded video:', `${API_URL}${post.videoUrl}`);
                    }}
                  >Ваш браузер не поддерживает тег video.</video>
                )}
              </div>
            )}
            {!post.imageUrl && !post.videoUrl && (
                <img 
                    src={DEFAULT_POST_IMAGE} 
                    alt="Placeholder"
                    className={styles.postMedia}
                />
            )}
          </div>
          <div className={styles.detailsSection}>
            <div className={styles.header}>
              <Link to={`/profile/${post.author?.username || ''}`} className={styles.authorAvatarLink} onClick={onClose}>
                <img 
                  src={post.author?.avatar ? 
                    (post.author.avatar.startsWith('http') ? post.author.avatar : `${API_URL}${post.author.avatar}`) 
                    : DEFAULT_AVATAR}
                  alt={post.author?.username}
                  className={styles.authorAvatar}
                  onError={(e) => {
                    console.error('Error loading avatar:', post.author?.avatar);
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              </Link>
              <Link to={`/profile/${post.author?.username || ''}`} className={styles.authorUsernameLink} onClick={onClose}>
                <span className={styles.authorUsername}>{post.author?.username}</span>
              </Link>
              
              <div className={styles.headerControls}>
                {currentUser && post.author && post.author._id !== currentUser._id && (
                  <button
                    className={isFollowing ? styles.unfollowButton : styles.followButton}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {followLoading ? '...' : (isFollowing ? 'Отписаться' : 'Подписаться')}
                  </button>
                )}
                {currentUser && currentUser._id === post.author?._id && (
                  <div className={styles.optionsMenuContainer}>
                    <button 
                      onClick={() => setShowOptionsMenu(prev => !prev)} 
                      className={styles.optionsButton}
                      aria-label="Post options"
                      disabled={postActionLoading}
                    >
                      ⋮
                    </button>
                    {showOptionsMenu && (
                      <div className={styles.optionsDropdown}>
                        <button onClick={handleAttemptDelete} className={`${styles.optionItem} ${styles.deleteItem}`} disabled={postActionLoading}>
                          Удалить
                        </button>
                        <button onClick={handleEdit} className={styles.optionItem} disabled={postActionLoading}>
                          Редактировать
                        </button>
                        <button onClick={handleCopyLink} className={styles.optionItem}>
                          Copy link
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.contentAndComments}>
              <div className={styles.contentScrollable}>
                {post.content && (
                    <div className={styles.captionContainer}>
                        <img 
                            src={post.author?.avatar ? (post.author.avatar.startsWith('http') ? post.author.avatar : `${API_URL}${post.author.avatar}`) : DEFAULT_AVATAR} 
                            alt={post.author?.username} 
                            className={styles.commentAuthorAvatar}
                        />
                        <p className={styles.caption}>
                        <span className={styles.commentAuthorUsername}>{post.author?.username}</span>
                        {' '}{post.content}
                        </p>
                    </div>
                )}
                <div className={styles.commentsSection}>
                  {renderComments()} 
                </div>
              </div> 

              <div className={styles.actionsAndFormContainer}>
                <div className={styles.actions}>
                  <button 
                    className={`${styles.likeButton} ${isLikedByCurrentUser ? styles.liked : ''}`}
                    onClick={handleLike}
                    disabled={likeLoading || postActionLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLikedByCurrentUser ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  <button 
                    onClick={handleFavoriteClick}
                    className={`${styles.actionButton} ${styles.favoriteButton}`}
                    aria-label={isFavorite ? "Удалить из сохраненного" : "Сохранить"}
                    disabled={postActionLoading}
                  >
                    {isFavorite ? (
                      <svg aria-label="Удалить из сохраненного" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path></svg>
                    ) : (
                      <svg aria-label="Сохранить" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                    )}
                  </button>
                </div>
                <div className={styles.stats}>
                  <span>
                    {post.likes?.length || 0} отметок "Нравится"
                  </span>
                </div>
                {post.createdAt && (
                  <div className={styles.postTimestamp}>
                    {new Date(post.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {postActionError && <p className={styles.errorTextModal}>{typeof postActionError === 'string' ? postActionError : JSON.stringify(postActionError)}</p>}
                
                <form onSubmit={handleAddComment} className={styles.commentForm}>
                  <input 
                    type="text" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Добавьте комментарий..." 
                    className={styles.commentInput}
                    disabled={postActionLoading}
                    ref={inputRef}
                  />
                  <button
                    type="button"
                    className={`${styles.commentSubmitButton} ${styles.emojiButton}`}
                    onClick={() => setShowEmojiPicker(v => !v)}
                    tabIndex={-1}
                    aria-label="Добавить эмодзи"
                  >😊</button>
                  {showEmojiPicker && (
                    <div className={styles.emojiPickerContainer}>
                      <EmojiPicker onEmojiClick={emojiData => handleEmojiClick(emojiData)} autoFocusSearch={false} height={350} width={300} />
                    </div>
                  )}
                  <button type="submit" className={styles.commentSubmitButton} disabled={!newComment.trim() || postActionLoading}>
                    {postActionLoading ? '...' : 'Отправить'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;