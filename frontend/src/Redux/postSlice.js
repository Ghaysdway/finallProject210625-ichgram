import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config/constants";

export const fetchAllPosts = createAsyncThunk(
  "posts/fetchAllPosts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.posts;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при получении постов"
      );
    }
  }
);

export const fetchFeedPosts = createAsyncThunk(
  "posts/fetchFeedPosts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.posts;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при получении ленты"
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при получении поста"
      );
    }
  }
);

export const likePost = createAsyncThunk(
  "posts/likePost",
  async (postId, { rejectWithValue }) => {
    console.log(`[postSlice.js] Attempting to like post with ID: ${postId}`);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при лайке поста"
      );
    }
  }
);

export const editPost = createAsyncThunk(
  "posts/editPost",
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/posts/${postId}`,
        postData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при редактировании поста"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { postId: postId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при удалении поста"
      );
    }
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/comments`,
        { postId, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { postId, comment: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при добавлении комментария"
      );
    }
  }
);

export const fetchFavoritePosts = createAsyncThunk(
  "posts/fetchFavoritePosts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при получении избранных постов"
      );
    }
  }
);

export const addPostToFavorites = createAsyncThunk(
  "posts/addPostToFavorites",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/favorites`,
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { postId, favoriteEntry: response.data.favorite };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при добавлении в избранное"
      );
    }
  }
);

export const removePostFromFavorites = createAsyncThunk(
  "posts/removePostFromFavorites",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/favorites/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ошибка при удалении из избранного"
      );
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    selectedPost: null,
    likeLoading: false,
    likeError: null,

    favoritePosts: [],
    favoriteLoading: false,
    favoriteError: null,
  },
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    updatePost: (state, action) => {
      const updatedPost = action.payload;
      const postIndex = state.posts.findIndex(
        (post) => post._id === updatedPost._id
      );
      if (postIndex !== -1) {
        state.posts[postIndex] = { ...state.posts[postIndex], ...updatedPost };
      }
      const favIndex = state.favoritePosts.findIndex(
        (post) => post._id === updatedPost._id
      );
      if (favIndex !== -1) {
        state.favoritePosts[favIndex] = {
          ...state.favoritePosts[favIndex],
          ...updatedPost,
        };
      }
    },

    setPostFavoriteStatus: (state, action) => {
      const { postId, isFavorite } = action.payload;
      const postInPosts = state.posts.find((p) => p._id === postId);
      if (postInPosts) {
        postInPosts.isFavorite = isFavorite;
      }
      const postInFavorites = state.favoritePosts.find((p) => p._id === postId);
      if (postInFavorites) {
        postInFavorites.isFavorite = isFavorite;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchAllPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.loading = false;
        console.log(
          "Posts data received in fetchAllPosts (postSlice.js):",
          action.payload
        );

        const favoriteIds = new Set(state.favoritePosts.map((p) => p._id));
        state.posts = action.payload.map((post) => ({
          ...post,
          isFavorite: favoriteIds.has(post._id),
        }));
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedPost = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(likePost.pending, (state) => {
        state.likeLoading = true;
        state.likeError = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.likeLoading = false;
        const updatedPost = action.payload;
        const postPredicate = (post) => post._id === updatedPost._id;
        const postIndex = state.posts.findIndex(postPredicate);
        if (postIndex !== -1)
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            ...updatedPost,
          };
        const favIndex = state.favoritePosts.findIndex(postPredicate);
        if (favIndex !== -1)
          state.favoritePosts[favIndex] = {
            ...state.favoritePosts[favIndex],
            ...updatedPost,
          };
        if (state.selectedPost && state.selectedPost._id === updatedPost._id) {
          state.selectedPost = updatedPost;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.likeLoading = false;
        state.likeError = action.payload;
      })

      .addCase(editPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPost.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPost = action.payload;
        const postPredicate = (post) => post._id === updatedPost._id;
        const postIndex = state.posts.findIndex(postPredicate);
        if (postIndex !== -1) state.posts[postIndex] = updatedPost;
        const favIndex = state.favoritePosts.findIndex(postPredicate);
        if (favIndex !== -1) state.favoritePosts[favIndex] = updatedPost;
        if (state.selectedPost && state.selectedPost._id === updatedPost._id) {
          state.selectedPost = updatedPost;
        }
      })
      .addCase(editPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(
          (post) => post._id !== action.payload.postId
        );
        state.favoritePosts = state.favoritePosts.filter(
          (post) => post._id !== action.payload.postId
        );
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addComment.pending, (state) => {
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.comments.push(comment);
        }
        if (state.selectedPost && state.selectedPost._id === postId) {
          state.selectedPost.comments.push(comment);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchFavoritePosts.pending, (state) => {
        state.favoriteLoading = true;
        state.favoriteError = null;
      })
      .addCase(fetchFavoritePosts.fulfilled, (state, action) => {
        state.favoriteLoading = false;

        state.favoritePosts = action.payload.map((post) => ({
          ...post,
          isFavorite: true,
        }));

        const favoriteIds = new Set(action.payload.map((p) => p._id));
        state.posts.forEach((post) => {
          if (favoriteIds.has(post._id)) {
            post.isFavorite = true;
          }
        });
        console.log(
          "Favorite posts fetched and processed (postSlice.js):",
          state.favoritePosts
        );
      })
      .addCase(fetchFavoritePosts.rejected, (state, action) => {
        state.favoriteLoading = false;
        state.favoriteError = action.payload;
        console.error(
          "Error fetching favorite posts (postSlice.js):",
          action.payload
        );
      })

      .addCase(addPostToFavorites.pending, (state) => {})
      .addCase(addPostToFavorites.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.isFavorite = true;
        }
        if (state.selectedPost && state.selectedPost._id === postId) {
          state.selectedPost.isFavorite = true;
        }
      })
      .addCase(addPostToFavorites.rejected, (state, action) => {})

      .addCase(removePostFromFavorites.pending, (state) => {})
      .addCase(removePostFromFavorites.fulfilled, (state, action) => {
        const postId = action.payload;
        state.favoritePosts = state.favoritePosts.filter(
          (p) => p._id !== postId
        );
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.isFavorite = false;
        }
        if (state.selectedPost && state.selectedPost._id === postId) {
          state.selectedPost.isFavorite = false;
        }
      })
      .addCase(removePostFromFavorites.rejected, (state, action) => {});
  },
});

export const { clearPostError, updatePost, setPostFavoriteStatus } =
  postSlice.actions;
export default postSlice.reducer;
