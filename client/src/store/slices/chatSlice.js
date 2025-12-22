import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${conversationId}`);
      return { conversationId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/messages/${conversationId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

// Create slice
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: {},
    loading: false,
    error: null,
    typingUsers: {},
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    setTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;
      state.typingUsers[conversationId] = userId;
    },
    clearTypingUser: (state, action) => {
      const { conversationId } = action.payload;
      delete state.typingUsers[conversationId];
    },
    clearChatError: (state) => {
      state.error = null;
    },
    clearChatState: (state) => {
      state.conversations = [];
      state.activeConversation = null;
      state.messages = {};
      state.typingUsers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const conversationId = action.payload.conversation;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(action.payload);
      });
  },
});

export const {
  setActiveConversation,
  addMessage,
  setTypingUser,
  clearTypingUser,
  clearChatError,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;