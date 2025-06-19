import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './PrivateRoute.module.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector(state => state.auth);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        Загрузка...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute; 