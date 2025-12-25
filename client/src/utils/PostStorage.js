// client/src/utils/PostStorage.js

const POSTS_STORAGE_KEY = 'facebook_posts';
const USERS_STORAGE_KEY = 'facebook_users';
const FEED_STORAGE_KEY = 'facebook_feed';

export const PostStorage = {
  // Save a new post
  savePost: (postData) => {
    const posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...postData,
      createdAt: new Date().toISOString(),
      reactionCount: 0,
      comments: [],
      shares: 0,
      views: 0,
      isReshare: false,
      originalPost: null
    };
    
    posts.unshift(post);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    return post;
  },

  // Get all posts
  getAllPosts: () => {
    return JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
  },

  // Get posts by user
  getPostsByUser: (userId) => {
    const posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    return posts.filter(post => post.user?.id === userId);
  },

  // Update a post
  updatePost: (postId, updates) => {
    const posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const index = posts.findIndex(p => p.id === postId);
    
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
      return posts[index];
    }
    
    return null;
  },

  // Delete a post
  deletePost: (postId) => {
    const posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const filteredPosts = posts.filter(p => p.id !== postId);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(filteredPosts));
    return filteredPosts;
  },

  // Reshare a post
  resharePost: (userId, originalPost, content = '') => {
    const posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const user = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY))?.find(u => u.id === userId);
    
    if (!user) return null;
    
    const reshare = {
      id: `reshare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified
      },
      content: content || `Shared ${originalPost.user?.username}'s post`,
      originalPost: {
        id: originalPost.id,
        user: originalPost.user,
        content: originalPost.content,
        media: originalPost.media
      },
      isReshare: true,
      createdAt: new Date().toISOString(),
      privacy: 'friends',
      reactionCount: 0,
      comments: [],
      shares: 0,
      views: 0
    };
    
    posts.unshift(reshare);
    
    // Increment original post's share count
    const originalIndex = posts.findIndex(p => p.id === originalPost.id);
    if (originalIndex !== -1) {
      posts[originalIndex].shares = (posts[originalIndex].shares || 0) + 1;
    }
    
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    return reshare;
  },

  // Generate feed with recommendations
  generateFeed: (userId, limit = 20) => {
    const posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const userReactions = JSON.parse(localStorage.getItem('user_reactions')) || {};
    
    // Add engagement score for ranking
    const postsWithScore = posts.map(post => ({
      ...post,
      score: calculatePostScore(post, userReactions, userId)
    }));
    
    // Sort by score (engagement + recency)
    const sortedPosts = postsWithScore.sort((a, b) => b.score - a.score);
    
    // Return limited feed
    return sortedPosts.slice(0, limit);
  },

  // Get post insights
  getPostInsights: (postId) => {
    const posts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const post = posts.find(p => p.id === postId);
    
    if (!post) return null;
    
    const engagementRate = ((post.comments?.length || 0) + (post.reactionCount || 0)) / (post.views || 1) * 100;
    
    return {
      reach: post.views || 0,
      engagement: (post.comments?.length || 0) + (post.reactionCount || 0),
      engagementRate: `${engagementRate.toFixed(1)}%`,
      shares: post.shares || 0,
      shareRate: `${((post.shares || 0) / (post.views || 1) * 100).toFixed(1)}%`,
      comments: post.comments?.length || 0,
      reactions: post.reactionCount || 0,
      createdAt: post.createdAt
    };
  }
};

// Helper function to calculate post score for feed ranking
const calculatePostScore = (post, userReactions, userId) => {
  let score = 0;
  
  // Recency (newer posts get higher score)
  const postAge = Date.now() - new Date(post.createdAt).getTime();
  const recencyScore = Math.max(0, 1 - (postAge / (7 * 24 * 60 * 60 * 1000))); // Decay over 7 days
  score += recencyScore * 50;
  
  // Engagement
  const engagementScore = (post.reactionCount || 0) * 2 + (post.comments?.length || 0) * 3 + (post.shares || 0) * 5;
  score += Math.min(engagementScore, 100); // Cap at 100
  
  // User interaction (if user has reacted/commented)
  if (userReactions[post.id]) {
    score += 30;
  }
  
  // If post is from followed user or friend
  if (post.user?.id === userId) {
    score += 20;
  }
  
  // If reshared by friends
  if (post.isReshare) {
    score += 15;
  }
  
  // Random factor for discovery
  score += Math.random() * 10;
  
  return score;
};