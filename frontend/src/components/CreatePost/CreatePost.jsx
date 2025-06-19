import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import styles from './CreatePost.module.css';

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [videoLink, setVideoLink] = useState('');
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadOption, setUploadOption] = useState('file');
  const currentUser = useSelector(state => state.auth.user);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVideoLink('');
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setMediaType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType(null);
        setPreview(null);
        setError('Неподдерживаемый тип файла. Пожалуйста, выберите изображение или видео.');
      }
    }
  };

  const handleVideoLinkChange = (e) => {
    setVideoLink(e.target.value);
    setFile(null);
    setPreview(null);
    setMediaType('video');
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setVideoLink('');
    setMediaType(null);
    setError(null);

    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Пожалуйста, добавьте описание.');
      return;
    }
    if (uploadOption === 'file' && !file) {
      setError('Пожалуйста, выберите файл для загрузки.');
      return;
    }
    if (uploadOption === 'link' && !videoLink.trim()) {
      setError('Пожалуйста, вставьте ссылку на видео.');
      return;
    }
    if (uploadOption === 'link') {
        try {
            new URL(videoLink);
        } catch (_) {
            setError('Пожалуйста, введите корректную ссылку на видео.');
            return;
        }
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('content', content);

      if (uploadOption === 'file' && file) {
        formData.append('image', file);
      } else if (uploadOption === 'link' && videoLink) {
        formData.append('videoLink', videoLink);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/posts`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data) {
        if (currentUser && currentUser.username) {
          navigate(`/profile/${currentUser.username}`);
        } else {
          navigate('/profile');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании публикации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPostContainer}>
      <h2>Создать публикацию</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.uploadOptions}>
          <button
            type="button"
            className={`${styles.optionButton} ${uploadOption === 'file' ? styles.activeOption : ''}`}
            onClick={() => { setUploadOption('file'); clearSelection(); }}
          >
            Загрузить файл
          </button>
          <button
            type="button"
            className={`${styles.optionButton} ${uploadOption === 'link' ? styles.activeOption : ''}`}
            onClick={() => { setUploadOption('link'); clearSelection(); }}
          >
            Ссылка на видео
          </button>
        </div>

        {uploadOption === 'file' && (
          <div className={styles.imageUpload}>
            {preview ? (
              <div className={styles.previewContainer}>
                {mediaType === 'image' && <img src={preview} alt="Preview" className={styles.preview} />}
                {mediaType === 'video' && <video src={preview} controls className={styles.preview} />}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={clearSelection}
                >
                  Удалить
                </button>
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  id="fileUpload"
                />
                <label htmlFor="fileUpload" className={styles.uploadLabel}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM3 15l6-6 4 4 2-2 4 4"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                  </svg>
                  <span>Выберите фото или видео</span>
                </label>
              </div>
            )}
          </div>
        )}

        {uploadOption === 'link' && (
          <div className={styles.linkUpload}>
            <input
              type="text"
              placeholder="Вставьте ссылку на видео (например, YouTube, Vimeo)"
              value={videoLink}
              onChange={handleVideoLinkChange}
              className={styles.linkInput}
            />
            {videoLink && (
                 <p className={styles.videoLinkHint}>Будет использована ссылка на видео. Превью для внешних ссылок не отображается.</p>
            )}
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Добавьте описание..."
          className={styles.caption}
          rows="4"
        />

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !content.trim() || (uploadOption === 'file' && !file) || (uploadOption === 'link' && !videoLink.trim())}
        >
          {loading ? 'Публикация...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost; 