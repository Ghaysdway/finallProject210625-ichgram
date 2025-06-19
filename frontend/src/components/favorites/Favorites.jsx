import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactPlayer from 'react-player/lazy';
import { fetchFavoritePosts, removePostFromFavorites } from '../../Redux/postSlice';
import styles from './Favorites.module.css';
import PostModal from '../PostModal/PostModal'; 
import { API_URL, DEFAULT_POST_IMAGE } from '../../config/constants';


const Favorites = () => {
  const dispatch = useDispatch();

  const { 
    favoritePosts, 
    favoriteLoading: loading, 
    favoriteError: error 
  } = useSelector((state) => state.posts);
  const currentUser = useSelector((state) => state.auth.user);

  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFavoritePosts());
  }, [dispatch]);

  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setIsPostModalOpen(false);
  };







  const handlePostActuallyDeleted = (deletedPostId) => {




    dispatch(fetchFavoritePosts()); 
  };
  

  const handlePostUnfavorited = (postId) => {
    dispatch(removePostFromFavorites(postId));


  }

  if (loading) {
    return <div className={styles.loading}>Loading favorite posts...</div>;
  }

  if (error) {
    return <div className={styles.loading}>{error?.message || 'Unknown error'}</div>;
  }

  return (
    <div className={styles.exploreContainer}> {}
     
      {(!favoritePosts || favoritePosts.length === 0) && !loading && (
        <p className={styles.noPostsMessage}>No favorite posts yet.</p> 
      )}
      <div className={styles.postsGrid}>
        {favoritePosts && favoritePosts.map((post) => {
          if (!post || !post._id) return null;

          console.log('Rendering favorite post in Favorites.jsx:', JSON.parse(JSON.stringify(post))); 
          
          const postImageSrc = (post.mediaType === 'image' || (!post.mediaType && post.imageUrl)) && post.imageUrl
            ? post.imageUrl.startsWith('http') ? post.imageUrl : `${API_URL}${post.imageUrl}`
            : DEFAULT_POST_IMAGE; 

          const safeLikesCount = post.likes?.length || 0;
          const commentsLength = post.commentsCount !== undefined ? post.commentsCount : (post.comments?.length || 0);

          const isLiked = currentUser && post.likes && post.likes.some(like => {
            if (!currentUser || !like) return false;
            if (typeof like === 'string') return like === currentUser._id;
            if (like._id && typeof like._id === 'string') return like._id === currentUser._id;
            if (like.user && typeof like.user === 'string') return like.user === currentUser._id;
            if (like.user && typeof like.user === 'object' && like.user._id) return like.user._id === currentUser._id;
            return false;
          });

          const overlayContent = (
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
          );

          return (
            <div key={post._id} className={styles.postItem} onClick={() => openPostModal(post)}>
              {(post.mediaType === 'image' || (!post.mediaType && post.imageUrl)) && post.imageUrl ? (
                <>
                  <img 
                    src={postImageSrc}
                    alt={post.content || 'Favorite post image'} 
                    className={styles.postImage} 
                    onError={(e) => { e.target.src = DEFAULT_POST_IMAGE; }}
                  />
                  {overlayContent}
                </>
              ) : post.mediaType === 'video' && post.videoUrl ? (
                <>
                  {post.videoUrl.startsWith('http') ? (
                    <div className={styles.videoPreviewContainer}>
                      <ReactPlayer
                        url={post.videoUrl}
                        className={styles.videoPreviewPlayer} 
                        width='100%'
                        height='100%'
                        light={true}
                        controls={false}
                        onError={(e) => console.error('[Favorites.jsx] ReactPlayer error (external):', e, post.videoUrl)}
                      />
                      <div className={styles.playIconOverlay}>
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.videoPreviewContainer}>
                      <video
                        src={`${API_URL}${post.videoUrl}`}
                        className={styles.videoElementPreview}
                        width="100%"
                        height="100%"
                        preload="metadata"
                        muted
                        playsInline
                        onError={(e) => console.error('[Favorites.jsx] HTML <video> error (local):', e, `${API_URL}${post.videoUrl}`)}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className={styles.playIconOverlay}>
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>
                      </div>
                    </div>
                  )}
                  {overlayContent}
                </>
              ) : (
                <>
                  <div className={styles.noImage}> {}
                    <img src={DEFAULT_POST_IMAGE} alt="Post media" className={styles.postImage}/>
                  </div>
                  {overlayContent}
                </>
              )}
            </div>
          )
        })}
      </div>
      {isPostModalOpen && selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={closePostModal}
          currentUser={currentUser}
          onPostDeleted={handlePostActuallyDeleted}
          onUpdate={() => dispatch(fetchFavoritePosts())}
        />
      )}
    </div>
  );
};

export default Favorites; 