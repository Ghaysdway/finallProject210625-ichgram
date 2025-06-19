import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostById } from '../../Redux/postSlice';
import { API_URL, DEFAULT_AVATAR } from '../../config/constants';
import styles from './PostPage.module.css';
import ReactPlayer from 'react-player/lazy';

const PostPage = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { selectedPost: post, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPostById(postId));
  }, [dispatch, postId]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!post) {
    return null;
  }
  
  const authorAvatar = post.author?.avatar 
    ? (post.author.avatar.startsWith('http') ? post.author.avatar : `${API_URL}${post.author.avatar}`) 
    : DEFAULT_AVATAR;

  return (
    <div className={styles.postPage}>
      <div className={styles.postContainer}>
        <div className={styles.postMedia}>
          {post.mediaType === 'image' && post.imageUrl && (
            <img src={`${API_URL}${post.imageUrl}`} alt="Post content" />
          )}
          {post.mediaType === 'video' && post.videoUrl && (
             <ReactPlayer url={`${API_URL}${post.videoUrl}`} controls playing />
          )}
        </div>
        <div className={styles.postDetails}>
          <div className={styles.authorHeader}>
            <img src={authorAvatar} alt={post.author?.username} className={styles.authorAvatar} />
            <span className={styles.authorUsername}>{post.author?.username}</span>
          </div>
          <div className={styles.commentsSection}>
            {post.comments?.map(comment => (
              <div key={comment._id} className={styles.comment}>
                <img 
                  src={comment.author?.avatar ? `${API_URL}${comment.author.avatar}` : DEFAULT_AVATAR} 
                  alt={comment.author?.username}
                  className={styles.commentAvatar} 
                />
                <div className={styles.commentContent}>
                  <span className={styles.commentUsername}>{comment.author?.username}</span>
                  <span>{comment.content}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage; 