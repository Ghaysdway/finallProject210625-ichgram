import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import { updateUserProfile } from '../../Redux/profileSlice';
import { checkAuth } from '../../Redux/authSlice'; 
import styles from './EditProfilePage.module.css';
import { API_URL } from '../../config/constants';

const EditProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.user);
  const { loading: profileLoading, error: profileError } = useSelector(state => state.profile);


  const handleSaveProfile = async (formDataFromModal) => {
    try {
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) throw new Error('ID пользователя не найден');
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Токен авторизации не найден');

      const sendData = new FormData();
      sendData.append('username', formDataFromModal.username || '');
      sendData.append('email', formDataFromModal.email || '');
      sendData.append('bio', formDataFromModal.bio || '');
      sendData.append('fullName', formDataFromModal.fullName || '');
      sendData.append('website', formDataFromModal.website || '');
      sendData.append('phone', formDataFromModal.phone || '');
      if (formDataFromModal.avatar && formDataFromModal.avatar instanceof File) {
        sendData.append('avatar', formDataFromModal.avatar);
      }

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: sendData
      });

      const text = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        throw new Error('Ошибка: сервер вернул не JSON.\n' + text);
      }
      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Ошибка обновления профиля');
      }

      navigate(`/profile/${currentUser.username}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    navigate('/settings'); 
  };

  if (!currentUser) {

    return <p className={styles.loadingText}>Loading user data...</p>;
  }



  return (
    <div className={styles.editProfilePageContainer}>
      <EditProfileModal
        profile={currentUser}
        onClose={handleCloseModal}
        onSave={handleSaveProfile}



      />
    </div>
  );
};

export default EditProfilePage; 