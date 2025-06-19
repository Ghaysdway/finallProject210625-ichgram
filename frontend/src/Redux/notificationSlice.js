import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config/constants";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при получении уведомлений"
      );
    }
  }
);

export const markNotificationsAsReadThunk = createAsyncThunk(
  "notifications/markNotificationsAsRead",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }
      await axios.post(
        `${API_URL}/api/notifications/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(fetchNotifications());
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Ошибка при отметке уведомлений как прочитанных"
      );
    }
  }
);

export const markSingleNotificationReadThunk = createAsyncThunk(
  "notifications/markSingleNotificationRead",
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }
      const response = await axios.post(
        `${API_URL}/api/notifications/${notificationId}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Ошибка при отметке одного уведомления как прочитанного"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markNotificationsAsReadThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationsAsReadThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationsAsReadThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markSingleNotificationReadThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(markSingleNotificationReadThunk.fulfilled, (state, action) => {
        const { notification: updatedNotification } = action.payload;
        if (updatedNotification) {
          const index = state.items.findIndex(
            (item) => item._id === updatedNotification._id
          );
          if (index !== -1) {
            state.items[index] = {
              ...state.items[index],
              ...updatedNotification,
            };
          }

          state.unreadCount = state.items.filter((n) => !n.read).length;
        }
      })
      .addCase(markSingleNotificationReadThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearNotificationsError } = notificationSlice.actions;
export default notificationSlice.reducer;
