const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const { uploadMedia, deleteMedia } = require('../utils/cloudinary');

// @route   POST /api/posts
// @desc    Create a post
router.post('/', protect, async (req, res) => {
  try {
    const { content, privacy, hashtags, feeling, activity, location } = req.body;
    
    const post = new Post({
      user: req.user.id,
      content,
      privacy: privacy || 'friends',
      hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : [],
      feeling,
      activity,
      location: location ? {
        type: 'Point',
        coordinates: [location.lng, location.lat],
        name: location.name
      } : undefined
    });

    // Handle media uploads
    if (req.files && req.files.length > 0) {
      const mediaUploads = req.files.map(async (file) => {
        const result = await uploadMedia(file, 'posts');
        return {
          type: file.mimetype.startsWith('image') ? 'image' : 
                 file.mimetype.startsWith('video') ? 'video' : 'gif',
          url: result.secure_url,
          publicId: result.public_id,
          thumbnail: result.type === 'video' ? result.thumbnail_url : null
        };
      });
      
      post.media = await Promise.all(mediaUploads);
    }

    await post.save();
    
    // Populate user data
    await post.populate('user', 'username profilePicture');
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/feed
// @desc    Get feed posts (algorithm-based)
router.get('/feed', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's friends
    const user = await User.findById(req.user.id);
    const friendIds = user.friends
      .filter(f => f.status === 'accepted')
      .map(f => f.user);
    
    // Algorithm: prioritize posts from close friends, recent posts, high engagement
    const posts = await Post.aggregate([
      {
        $match: {
          $or: [
            { user: { $in: friendIds } },
            { privacy: 'public' },
            { 
              $and: [
                { privacy: 'friends' },
                { user: { $in: friendIds } }
              ]
            }
          ],
          isHidden: false
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          // Calculate engagement score
          engagementScore: {
            $add: [
              { $size: '$reactions' },
              { $size: '$comments' },
              { $size: '$shares' },
              { $multiply: ['$viewCount', 0.1] }
            ]
          },
          // Calculate recency score (more recent = higher score)
          recencyScore: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 // Hours since creation
            ]
          },
          // Friend closeness (if user is a close friend)
          closenessScore: {
            $cond: {
              if: { $in: ['$user._id', user.closeFriends || []] },
              then: 10,
              else: 1
            }
          }
        }
      },
      {
        $addFields: {
          totalScore: {
            $add: [
              { $multiply: ['$engagementScore', 2] },
              { $multiply: ['$closenessScore', 3] },
              { $divide: [100, '$recencyScore'] } // Inverse of recency
            ]
          }
        }
      },
      { $sort: { totalScore: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          'user.password': 0,
          'user.email': 0,
          'user.friends': 0
        }
      }
    ]);

    res.json({
      posts,
      page,
      limit,
      hasMore: posts.length === limit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id/react
// @desc    React to a post
router.put('/:id/react', protect, async (req, res) => {
  try {
    const { reaction } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove existing reaction from same user
    post.reactions = post.reactions.filter(
      r => r.user.toString() !== req.user.id
    );

    // Add new reaction
    post.reactions.push({
      user: req.user.id,
      type: reaction
    });

    await post.save();
    
    // Create notification if not reacting to own post
    if (post.user.toString() !== req.user.id) {
      await createNotification({
        type: 'like',
        from: req.user.id,
        to: post.user,
        post: post._id
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user.id,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    
    // Populate user data in comment
    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username profilePicture');
    
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];
    
    // Create notification
    if (post.user.toString() !== req.user.id) {
      await createNotification({
        type: 'comment',
        from: req.user.id,
        to: post.user,
        post: post._id
      });
    }

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/share
// @desc    Share a post
router.post('/:id/share', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const originalPost = await Post.findById(req.params.id);
    
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create shared post
    const sharedPost = new Post({
      user: req.user.id,
      content: content || '',
      sharedFrom: originalPost._id,
      privacy: 'friends'
    });

    await sharedPost.save();
    
    // Add share to original post
    originalPost.shares.push({
      user: req.user.id,
      content: content || '',
      createdAt: new Date()
    });

    await originalPost.save();
    
    // Create notification
    if (originalPost.user.toString() !== req.user.id) {
      await createNotification({
        type: 'share',
        from: req.user.id,
        to: originalPost.user,
        post: originalPost._id
      });
    }

    res.json(sharedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;