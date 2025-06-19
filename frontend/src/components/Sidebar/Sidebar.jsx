import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../Redux/authSlice';
import { toggleTheme } from '../../Redux/themeSlice';
import styles from './Sidebar.module.css';
import {LOGO_URL}  from '../../config/constants';
import ReportProblemModal from '../ReportProblemModal/ReportProblemModal';

const Sidebar = ({ onToggleSearch }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const unreadNotificationsCount = useSelector(state => state.notifications.unreadCount);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const menuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.matchMedia('(max-width: 391px)').matches);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSettings = () => {
    navigate('/settings');
    setIsMenuOpen(false);
  };

  const handleActivity = () => {
    navigate('/activity');
    setIsMenuOpen(false);
  };

  const handleSwitchAppearance = () => {
    dispatch(toggleTheme());
    setIsMenuOpen(false);
  };

  const handleReportProblem = () => {
    setIsReportModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleSaved = () => {
    navigate('/favorites');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    if (path.startsWith('/profile/') && location.pathname.startsWith('/profile/')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Link to="/" className={styles.logo}>
          <img src={LOGO_URL} alt="Instagram" className={styles.instagramLogo} />
        </Link>
      </div>

      <nav className={styles.sidebarNav}>
        <Link to="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
          <div className={styles.navIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span className={styles.navTitle}>Главная</span>
        </Link>

        {!isMobile && (
          <div 
            className={`${styles.navItem} ${styles.searchButton}`}
            onClick={onToggleSearch}
          >
            <div className={styles.navIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <span className={styles.navTitle}>Поиск</span>
          </div>
        )}

        <Link to="/explore" className={`${styles.navItem} ${isActive('/explore') ? styles.active : ''}`}>
          <div className={styles.navIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </div>
          <span className={styles.navTitle}>Интересное</span>
        </Link>

        <Link to="/favorites" className={`${styles.navItem} ${isActive('/favorites') ? styles.active : ''}`}>
          <div className={styles.navIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <span className={styles.navTitle}>Сохраненные</span>
        </Link>

        <Link to="/notifications" className={`${styles.navItem} ${isActive('/notifications') ? styles.active : ''}`}>
          <div className={styles.navIconContainer}>
            <div className={styles.navIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            {unreadNotificationsCount > 0 && (
              <span className={styles.notificationBadge}>{unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}</span>
            )}
          </div>
          <span className={styles.navTitle}>Уведомления</span>
        </Link>

        <Link to="/create-post" className={`${styles.navItem} ${isActive('/create-post') ? styles.active : ''}`}>
          <div className={styles.navIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <span className={styles.navTitle}>Создать</span>
        </Link>

        {user && (
          <Link to={`/profile/${user.username}`} className={`${styles.navItem} ${isActive(`/profile/${user.username}`) ? styles.active : ''}`}>
            <div className={styles.navIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className={styles.navTitle}>Профиль</span>
          </Link>
        )}

        <div className={`${styles.navItem} ${styles.menuTrigger}`} onClick={toggleMenu}>
          <div className={styles.navIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </div>
          <span className={styles.navTitle}>Еще</span>
        </div>

        {isMenuOpen && (
          <div className={styles.dropdownMenu} ref={menuRef}>
            <div className={styles.dropdownMenuItem} onClick={handleSettings}>
              Настройки
            </div>
            <div className={styles.dropdownMenuItem} onClick={handleActivity}>
              Ваши действия
            </div>
            <div className={styles.dropdownMenuItem} onClick={handleSaved}>
              Сохраненное
            </div>
            <div className={styles.dropdownMenuItem} onClick={handleSwitchAppearance}>
              Переключить режим
            </div>
            <div className={styles.dropdownMenuItem} onClick={handleReportProblem}>
              Сообщить о проблеме
            </div>
            <div className={`${styles.dropdownMenuItem} ${styles.dropdownMenuItemLogout}`} onClick={handleLogout}>
              Выйти
            </div>
          </div>
        )}
      </nav>

      <ReportProblemModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar; 