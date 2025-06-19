import { createSlice } from "@reduxjs/toolkit";

export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";
export const THEME_SKY_BLUE = "sky-blue";
export const THEME_LIGHT_RED = "light-red";
export const THEME_NATURE = "nature";
export const THEME_CITY = "city";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (
    savedTheme &&
    [
      THEME_LIGHT,
      THEME_DARK,
      THEME_SKY_BLUE,
      THEME_LIGHT_RED,
      THEME_NATURE,
      THEME_CITY,
    ].includes(savedTheme)
  ) {
    return savedTheme;
  }

  return THEME_LIGHT;
};

const initialState = {
  currentTheme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      if (
        [
          THEME_LIGHT,
          THEME_DARK,
          THEME_SKY_BLUE,
          THEME_LIGHT_RED,
          THEME_NATURE,
          THEME_CITY,
        ].includes(action.payload)
      ) {
        state.currentTheme = action.payload;
        localStorage.setItem("theme", action.payload);
      } else {
        console.warn(`Invalid theme: ${action.payload}. Theme not changed.`);
      }
    },
    toggleTheme: (state) => {
      const themes = [
        THEME_LIGHT,
        THEME_DARK,
        THEME_SKY_BLUE,
        THEME_LIGHT_RED,
        THEME_NATURE,
        THEME_CITY,
      ];
      const currentIndex = themes.indexOf(state.currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      state.currentTheme = themes[nextIndex];
      localStorage.setItem("theme", themes[nextIndex]);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
