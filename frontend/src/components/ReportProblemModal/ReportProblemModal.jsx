import React, { useState, useEffect } from 'react';
import styles from './ReportProblemModal.module.css';

const ReportProblemModal = ({ isOpen, onClose }) => {
  const [problemDescription, setProblemDescription] = useState('');

  useEffect(() => {

    if (isOpen) {
      setProblemDescription('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problemDescription.trim() === '') {
      alert('Пожалуйста, опишите проблему.');
      return;
    }
    console.log('Problem Reported:', problemDescription);

    alert('Спасибо! Ваше сообщение отправлено.');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <h2>Сообщить о проблеме</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.problemTextarea}
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="Опишите проблему, с которой вы столкнулись..."
            rows={6}
            required
          />
          <div className={styles.modalActions}>
            <button type="button" className={`${styles.modalButton} ${styles.cancelButton}`} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={`${styles.modalButton} ${styles.submitButton}`}>
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportProblemModal; 