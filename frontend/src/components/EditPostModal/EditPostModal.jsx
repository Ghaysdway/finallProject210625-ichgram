import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editPost } from '../../Redux/postSlice';
import styles from './EditPostModal.module.css';

const EditPostModal = ({ post, onClose, onPostUpdated }) => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.posts);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
    }
  }, [post]);

  if (!post) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Содержание поста не может быть пустым.');
      return;
    }

    try {
      const updatedPostData = await dispatch(editPost({ postId: post._id, postData: { content } })).unwrap();
      if (onPostUpdated) {
        onPostUpdated(updatedPostData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Редактировать публикацию</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="postContent">Описание</label>
            <textarea
              id="postContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              rows="5"
              placeholder="Введите новое описание..."
            />
          </div>
          {error && <p className={styles.errorText}>{typeof error === 'string' ? error : JSON.stringify(error)}</p>}
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={`${styles.button} ${styles.cancelButton}`} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal; 