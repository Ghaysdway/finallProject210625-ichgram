import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config/constants";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (username, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const profileResponse = await axios.get(
        `${API_URL}/api/users/profile/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const postsResponse = await axios.get(
        `${API_URL}/api/posts/user/${profileResponse.data._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const profileData = {
        ...profileResponse.data,
        id: profileResponse.data._id || profileResponse.data.id,
        username: profileResponse.data.username || username,
        avatar: profileResponse.data.avatar || null,
        fullName: profileResponse.data.fullName || "",
        bio: profileResponse.data.bio || "",
        website: profileResponse.data.website || "",
        followersCount: profileResponse.data.followersCount || 0,
        followingCount: profileResponse.data.followingCount || 0,
        postsCount: postsResponse.data.length || 0,
        posts: postsResponse.data || [],
      };

      return profileData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Ошибка при загрузке профиля"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.keys(profileData).forEach((key) => {
        if (key === "avatar" && profileData[key] instanceof File) {
          formData.append("avatar", profileData[key]);
        } else {
          formData.append(key, profileData[key]);
        }
      });

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при обновлении профиля"
      );
    }
  }
);

export const followUser = createAsyncThunk(
  "profile/followUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/follow/follow`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при подписке"
      );
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "profile/unfollowUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/follow/unfollow`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при отписке"
      );
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  "profile/fetchFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/users/${userId}/followers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке подписчиков"
      );
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  "profile/fetchFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/users/${userId}/following`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при загрузке подписок"
      );
    }
  }
);

const initialState = {
  profile: null,
  posts: [],
  loading: false,
  error: null,
  isEditing: false,
  updateSuccess: false,
  followLoading: false,
  followError: null,
  followersList: [],
  followersLoading: false,
  followersError: null,
  followingList: [],
  followingLoading: false,
  followingError: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setEditing: (state, action) => {
      state.isEditing = action.payload;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearFollowLists: (state) => {
      state.followersList = [];
      state.followingList = [];
      state.followersError = null;
      state.followingError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.posts = action.payload.posts;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
        state.updateSuccess = true;
        state.isEditing = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })

      .addCase(followUser.pending, (state) => {
        state.followLoading = true;
        state.followError = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followLoading = false;

        const followedUserId = action.payload.follow.following;

        if (state.profile && state.profile._id === followedUserId) {
          state.profile.followersCount =
            (state.profile.followersCount || 0) + 1;
          state.profile.isFollowing = true;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followLoading = false;
        state.followError = action.payload;
      })

      .addCase(unfollowUser.pending, (state) => {
        state.followLoading = true;
        state.followError = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followLoading = false;

        const unfollowedUserId = action.meta.arg;

        if (state.profile && state.profile._id === unfollowedUserId) {
          state.profile.followersCount = Math.max(
            0,
            (state.profile.followersCount || 0) - 1
          );
          state.profile.isFollowing = false;
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.followLoading = false;
        state.followError = action.payload;
      })

      .addCase(fetchFollowers.pending, (state) => {
        state.followersLoading = true;
        state.followersError = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followersLoading = false;
        state.followersList = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.followersLoading = false;
        state.followersError = action.payload;
        state.followersList = [];
      })

      .addCase(fetchFollowing.pending, (state) => {
        state.followingLoading = true;
        state.followingError = null;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.followingLoading = false;
        state.followingList = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.followingLoading = false;
        state.followingError = action.payload;
        state.followingList = [];
      });
  },
});

export const {
  setEditing,
  clearProfileError,
  clearUpdateSuccess,
  clearFollowLists,
} = profileSlice.actions;
export default profileSlice.reducer;
