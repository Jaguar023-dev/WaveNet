import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feed');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(postData).forEach(key => {
        if (key !== 'media') {
          formData.append(key, postData[key]);
        }
      });
      
      // Append media files
      if (postData.media && postData.media.length > 0) {
        postData.media.forEach(file => {
          formData.append('media', file);
        });
      }
      
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const reactToPost = createAsyncThunk(
  'posts/react',
  async ({ postId, reaction }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${postId}/react`, { reaction });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to react');
    }
  }
);

export const commentOnPost = createAsyncThunk(
  'posts/comment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { content });
      return { postId, comment: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to comment');
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    feed: [],
    currentPost: null,
    hasMore: true,
    page: 1,
    loading: false,
    error: null,
    uploading: false,
  },
  reducers: {
    clearPosts: (state) => {
      state.feed = [];
      state.page = 1;
      state.hasMore = true;
    },
    addNewPost: (state, action) => {
      state.feed.unshift(action.payload);
    },
    updatePostReaction: (state, action) => {
      const { postId, reaction, userId } = action.payload;
      const post = state.feed.find(p => p._id === postId);
      if (post) {
        post.reactions = post.reactions.filter(r => r.user._id !== userId);
        if (reaction) {
          post.reactions.push({ user: userId, type: reaction });
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = [...state.feed, ...action.payload.posts];
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page + 1;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.uploading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.uploading = false;
        state.feed.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // React to Post
      .addCase(reactToPost.fulfilled, (state, action) => {
        const index = state.feed.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.feed[index] = action.payload;
        }
      })
      // Comment on Post
      .addCase(commentOnPost.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.feed.find(p => p._id === postId);
        if (post) {
          post.comments.push(comment);
        }
      });
  },
});

export const { clearPosts, addNewPost, updatePostReaction } = postSlice.actions;
export default postSlice.reducer;