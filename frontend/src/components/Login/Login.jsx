import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../Redux/authSlice";
import styles from "./Login.module.css";
import { LOGO_URL } from "../../config/constants";
import backgroundImg from "../../assets/Background.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    error: authError,
    isAuthenticated,
    loading: isLoading,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (authError) {
      dispatch(clearError());
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }
    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    dispatch(loginUser({ email: formData.email, password: formData.password }));
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.imageBox}>
        <img
          src={backgroundImg}
          alt="Preview"
          className={styles.imagePreview}
        />
      </div>
      <div className={styles.authContainer1}>
        <div className={styles.authBox}>
          <div className={styles.logo}>
            <img src={LOGO_URL} alt="Instagram" />
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
              />
              {fieldErrors.email && (
                <div className={styles.error}>{fieldErrors.email}</div>
              )}
            </div>
            <div className={styles.inputGroup}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.showPasswordButton}
              >
                {showPassword ? "Скрыть" : "Показать"}
              </button>
              {fieldErrors.password && (
                <div className={styles.error}>{fieldErrors.password}</div>
              )}
            </div>
            {authError && (
              <div className={styles.error}>
                {typeof authError === "string"
                  ? authError
                  : JSON.stringify(authError)}
              </div>
            )}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>
          <Link to="/forgot-password" className={styles.forgotPassword}>
            Забыли пароль?
          </Link>
        </div>

        <div className={styles.authBox}>
          <p className={styles.registerPrompt}>
            У вас ещё нет аккаунта?{" "}
            <Link to="/register" className={styles.registerLink}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
