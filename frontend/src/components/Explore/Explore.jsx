import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPosts } from '../../Redux/postSlice';
import styles from './Explore.module.css';
import { API_URL, DEFAULT_POST_IMAGE } from '../../config/constants';
import PostModal from '../PostModal/PostModal';
import { FaHeart, FaComment } from 'react-icons/fa';
import ReactPlayer from 'react-player/lazy';
import UserSearch from '../Search/UserSearch';

const Explore = () => {
    const dispatch = useDispatch();
    const { posts, loading, error } = useSelector((state) => state.posts);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    useEffect(() => {
        dispatch(fetchAllPosts());
    }, [dispatch]);

    useEffect(() => {
        const checkWidth = () => {
            setShowMobileSearch(window.matchMedia('(max-width: 391px)').matches);
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    const handleCloseModal = () => {
        setSelectedPost(null);
    };
    
    const handleUpdatePost = () => {
        dispatch(fetchAllPosts());
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    if (error) {
        return <div className={styles.error}>Ошибка: {error}</div>;
    }

    return (
        <div className={styles.exploreContainer}>
            {showMobileSearch && (
                <div className="mobile-user-search-bar">
                    <UserSearch inline />
                </div>
            )}
            <div className={styles.exploreGrid}>
                {posts.map((post) => {
                    const isLikedByCurrentUser = post.likes.includes(currentUser?._id);

                    return (
                        <div 
                            key={post._id} 
                            className={styles.postItem}
                            onClick={() => setSelectedPost(post)}
                        >
                            {post.mediaType === 'video' && post.videoUrl ? (
                                post.videoUrl.startsWith('http') ? (
                                    <div className={styles.videoPreviewContainer}>
                                        <ReactPlayer
                                            url={post.videoUrl}
                                            className={styles.videoPreviewPlayer}
                                            width="100%"
                                            height="100%"
                                            controls={false}
                                            light={true}
                                            playIcon={<div className={styles.playIconOverlay}><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg></div>}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.videoPreviewContainer}>
                                        <video
                                            src={`${API_URL}${post.videoUrl}`}
                                            className={styles.videoElementPreview}
                                            muted
                                            disablePictureInPicture
                                            preload="metadata"
                                        />
                                        <div className={styles.playIconOverlay}>
                                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <img 
                                    src={`${API_URL}${post.imageUrl}`} 
                                    alt={post.content}
                                    className={styles.postMedia}
                                    onError={(e) => { e.target.src = DEFAULT_POST_IMAGE; }}
                                />
                            )}
                            <div className={styles.overlay}>
                                <div className={styles.stats}>
                                    <span className={isLikedByCurrentUser ? styles.liked : ''}>
                                        <FaHeart /> {post.likes.length}
                                    </span>
                                    <span><FaComment /> {post.comments.length}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedPost && (
                <PostModal 
                    post={selectedPost}
                    onClose={handleCloseModal}
                    onUpdatePost={handleUpdatePost}
                    onDeletePost={handleUpdatePost}
                />
            )}
        </div>
    );
};

export default Explore; 