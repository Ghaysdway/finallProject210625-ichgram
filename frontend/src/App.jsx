import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from './Redux/authSlice';
import { THEME_DARK, THEME_LIGHT, THEME_SKY_BLUE, THEME_LIGHT_RED, THEME_NATURE, THEME_CITY } from './Redux/themeSlice';
import { fetchNotifications } from './Redux/notificationSlice';
import Login from './components/Login/Login';
import Register from './components/Registration/Registration';
import Feed from './components/Feed/Feed';
import Sidebar from './components/Sidebar/Sidebar';
import Profile from './components/Profile/Profile';
import CreatePost from './components/CreatePost/CreatePost';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ResetPassword from './components/ResetPassword/ResetPassword';
import UserSearch from './components/Search/UserSearch';
import Favorites from './components/favorites/Favorites';
import Notifications from './components/notifications/Notifications';
import Explore from './components/Explore/Explore';
import styles from './App.module.css';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import ActivityPage from './pages/ActivityPage/ActivityPage';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';
import CommentsSettingsPage from './pages/CommentsSettingsPage/CommentsSettingsPage';
import LanguageSettingsPage from './pages/LanguageSettingsPage/LanguageSettingsPage';
import ChangePasswordPage from './pages/ChangePasswordPage/ChangePasswordPage';
import PostPage from './pages/PostPage/PostPage';


const MainLayout = () => {
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSearchPanelOpen(false);
  }, [location]);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.matchMedia('(max-width: 391px)').matches);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const toggleSearchPanel = () => setIsSearchPanelOpen(!isSearchPanelOpen);
  const closeSearchPanel = () => setIsSearchPanelOpen(false);

  return (
    <div className={styles.contentWrapper}>
      {!isMobile && (
        <UserSearch isOpen={isSearchPanelOpen} onClose={closeSearchPanel} />
      )}
      <Sidebar onToggleSearch={toggleSearchPanel} />
      <main className={`${styles.mainContent} ${styles.withSidebar}`}>
        <Outlet />
      </main>
    </div>
  );
};


const PrivateRouteWrapper = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};


const PublicRouteWrapper = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const currentTheme = useSelector(state => state.theme.currentTheme);

  useEffect(() => { dispatch(checkAuth()); }, [dispatch]);

  useEffect(() => { if (isAuthenticated) { dispatch(fetchNotifications()); } }, [isAuthenticated, dispatch]);
  
  useEffect(() => {
    const themeClass = {
      [THEME_LIGHT]: 'theme-light',
      [THEME_DARK]: 'theme-dark',
      [THEME_SKY_BLUE]: 'theme-sky-blue',
      [THEME_LIGHT_RED]: 'theme-light-red',
      [THEME_NATURE]: 'theme-nature',
      [THEME_CITY]: 'theme-city'
    }[currentTheme] || 'theme-light';
    
    document.body.className = themeClass;
  }, [currentTheme]);

  const appClassName = `${styles.app} ${currentTheme === THEME_DARK ? styles.themeDark : styles.themeLight}`;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <div className={appClassName}>
      <Routes>
        <Route element={<PublicRouteWrapper />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route element={<PrivateRouteWrapper />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/comments" element={<CommentsSettingsPage />} />
            <Route path="/settings/language" element={<LanguageSettingsPage />} />
            <Route path="/settings/change-password" element={<ChangePasswordPage />} />
            <Route path="/activity" element={<ActivityPage />} />
          </Route>
          
          <Route path="/post/:postId" element={<PostPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
