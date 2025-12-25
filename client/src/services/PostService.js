// client/src/services/PostService.js

const STORAGE_KEYS = {
  POSTS: 'facebook_posts',
  USERS: 'facebook_users',
  USER_DATA: 'facebook_user_data',
  FEED: 'facebook_feed_cache'
};

class PostService {
  constructor() {
    this.initDefaultUser();
  }

  // Initialize default user if none exists
  initDefaultUser() {
    const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
    if (users.length === 0) {
      const defaultUser = {
        id: 'user_1',
        username: 'Current User',
        email: 'user@example.com',
        profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
        isVerified: true,
        friends: [],
        createdAt: new Date().toISOString()
      };
      this.saveToStorage(STORAGE_KEYS.USERS, [defaultUser]);
      this.saveToStorage('current_user', defaultUser.id);
    }
  }

  // Get current user
  getCurrentUser() {
    const userId = this.getFromStorage('current_user') || 'user_1';
    const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
    return users.find(user => user.id === userId) || users[0];
  }

  // Get all posts from storage
  getAllPosts() {
    return this.getFromStorage(STORAGE_KEYS.POSTS) || [];
  }

  // Get posts for feed (with recommendations)
  getFeedPosts(userId, limit = 20) {
    let posts = this.getAllPosts();
    
    // If no posts exist, create some sample posts
    if (posts.length === 0) {
      posts = this.createInitialPosts();
    }
    
    // Filter out posts based on privacy settings
    const filteredPosts = posts.filter(post => {
      if (post.privacy === 'public') return true;
      if (post.privacy === 'friends' && post.user?.id === userId) return true;
      if (post.privacy === 'only_me' && post.user?.id === userId) return true;
      return false;
    });
    
    // Sort by date (newest first)
    return filteredPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Create initial posts if none exist
  createInitialPosts() {
    const currentUser = this.getCurrentUser();
    
    const initialPosts = [
      {
        id: 'post_1',
        user: {
          id: currentUser.id,
          username: currentUser.username,
          profilePicture: currentUser.profilePicture,
          isVerified: currentUser.isVerified
        },
        content: "Welcome to your personal social network! Create your first post above. 👆",
        privacy: 'public',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        reactionCount: 5,
        comments: [
          {
            id: 'comment_1',
            user: {
              id: 'user_2',
              username: 'Alex Johnson',
              profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
              isVerified: false
            },
            content: "Great feature! Looking forward to using this.",
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            likes: 2
          }
        ],
        shares: 1,
        views: 25,
        hashtags: ['welcome', 'firstpost']
      },
      {
        id: 'post_2',
        user: {
          id: 'user_3',
          username: 'Sarah Miller',
          profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg',
          isVerified: true
        },
        content: "Excited to see this platform grow! 🚀 What features would you like to see next?",
        privacy: 'public',
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        reactionCount: 12,
        comments: [],
        shares: 3,
        views: 48,
        hashtags: ['feedback', 'suggestions']
      }
    ];
    
    this.saveToStorage(STORAGE_KEYS.POSTS, initialPosts);
    return initialPosts;
  }

  // Create a new post
  createPost(postData) {
    const posts = this.getAllPosts();
    const currentUser = this.getCurrentUser();
    
    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        isVerified: currentUser.isVerified
      },
      content: postData.content || '',
      privacy: postData.privacy || 'public',
      media: postData.media || [],
      hashtags: this.extractHashtags(postData.content),
      location: postData.location || null,
      feeling: postData.feeling || null,
      createdAt: new Date().toISOString(),
      reactionCount: 0,
      comments: [],
      shares: 0,
      views: 0,
      isReshare: false,
      originalPost: null
    };
    
    posts.unshift(newPost);
    this.saveToStorage(STORAGE_KEYS.POSTS, posts);
    
    return newPost;
  }

  // Reshare a post
  resharePost(originalPostId, content = '') {
    const posts = this.getAllPosts();
    const originalPost = posts.find(p => p.id === originalPostId);
    
    if (!originalPost) {
      throw new Error('Original post not found');
    }
    
    const currentUser = this.getCurrentUser();
    const reshareContent = content || `Shared ${originalPost.user.username}'s post`;
    
    const resharePost = {
      id: `reshare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        isVerified: currentUser.isVerified
      },
      content: reshareContent,
      privacy: 'friends',
      isReshare: true,
      originalPost: {
        id: originalPost.id,
        user: originalPost.user,
        content: originalPost.content,
        media: originalPost.media,
        createdAt: originalPost.createdAt
      },
      createdAt: new Date().toISOString(),
      reactionCount: 0,
      comments: [],
      shares: 0,
      views: 0,
      hashtags: this.extractHashtags(reshareContent)
    };
    
    // Increment original post share count
    originalPost.shares = (originalPost.shares || 0) + 1;
    
    posts.unshift(resharePost);
    this.saveToStorage(STORAGE_KEYS.POSTS, posts);
    
    return resharePost;
  }

  // Add a comment to a post
  addComment(postId, commentContent) {
    const posts = this.getAllPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    const currentUser = this.getCurrentUser();
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        isVerified: currentUser.isVerified
      },
      content: commentContent,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    posts[postIndex].comments = posts[postIndex].comments || [];
    posts[postIndex].comments.push(newComment);
    
    this.saveToStorage(STORAGE_KEYS.POSTS, posts);
    
    return newComment;
  }

  // React to a post
  reactToPost(postId, reactionType) {
    const posts = this.getAllPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    
    // Get user reactions
    const userReactions = this.getFromStorage('user_reactions') || {};
    const currentReaction = userReactions[postId];
    
    // Update post reaction count
    if (currentReaction === reactionType) {
      // Remove reaction
      posts[postIndex].reactionCount = Math.max(0, (posts[postIndex].reactionCount || 0) - 1);
      delete userReactions[postId];
    } else {
      // Add or change reaction
      if (currentReaction) {
        // Already has a reaction, changing it (count stays the same)
      } else {
        // New reaction
        posts[postIndex].reactionCount = (posts[postIndex].reactionCount || 0) + 1;
      }
      userReactions[postId] = reactionType;
    }
    
    // Save updates
    this.saveToStorage(STORAGE_KEYS.POSTS, posts);
    this.saveToStorage('user_reactions', userReactions);
    
    return {
      reactionCount: posts[postIndex].reactionCount,
      userReaction: userReactions[postId] || null
    };
  }

  // Get user's reaction to a post
  getUserReaction(postId) {
    const userReactions = this.getFromStorage('user_reactions') || {};
    return userReactions[postId] || null;
  }

  // Delete a post
  deletePost(postId) {
    const posts = this.getAllPosts();
    const filteredPosts = posts.filter(p => p.id !== postId);
    this.saveToStorage(STORAGE_KEYS.POSTS, filteredPosts);
    return filteredPosts;
  }

  // Get post insights
  getPostInsights(postId) {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return null;
    }
    
    const engagement = (post.comments?.length || 0) + (post.reactionCount || 0);
    const engagementRate = ((engagement) / (post.views || 1) * 100).toFixed(1);
    const shareRate = ((post.shares || 0) / (post.views || 1) * 100).toFixed(1);
    
    return {
      reach: post.views || 0,
      engagement: engagement,
      engagementRate: `${engagementRate}%`,
      shares: post.shares || 0,
      shareRate: `${shareRate}%`,
      comments: post.comments?.length || 0,
      reactions: post.reactionCount || 0,
      createdAt: post.createdAt,
      demographics: {
        locations: ['United States', 'India', 'UK', 'Canada'],
        ageGroups: {
          '18-24': Math.floor(Math.random() * 30) + 20,
          '25-34': Math.floor(Math.random() * 40) + 30,
          '35-44': Math.floor(Math.random() * 20) + 15,
          '45+': Math.floor(Math.random() * 10) + 5
        }
      }
    };
  }

  // Increment post view count
  incrementViewCount(postId) {
    const posts = this.getAllPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      posts[postIndex].views = (posts[postIndex].views || 0) + 1;
      this.saveToStorage(STORAGE_KEYS.POSTS, posts);
      return posts[postIndex].views;
    }
    
    return 0;
  }

  // Save post to user's saved posts
  savePost(postId) {
    const savedPosts = this.getFromStorage('saved_posts') || [];
    
    if (!savedPosts.includes(postId)) {
      savedPosts.push(postId);
      this.saveToStorage('saved_posts', savedPosts);
      return true;
    }
    
    return false;
  }

  // Remove post from saved posts
  unsavePost(postId) {
    const savedPosts = this.getFromStorage('saved_posts') || [];
    const index = savedPosts.indexOf(postId);
    
    if (index > -1) {
      savedPosts.splice(index, 1);
      this.saveToStorage('saved_posts', savedPosts);
      return true;
    }
    
    return false;
  }

  // Check if post is saved
  isPostSaved(postId) {
    const savedPosts = this.getFromStorage('saved_posts') || [];
    return savedPosts.includes(postId);
  }

  // Helper methods
  extractHashtags(text) {
    if (!text) return [];
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  }

  getFromStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Clear all data (for testing)
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('user_reactions');
    localStorage.removeItem('saved_posts');
    localStorage.removeItem('current_user');
    this.initDefaultUser();
  }
}

export default new PostService();