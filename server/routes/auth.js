// server/routes/auth.js - Update login response
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        isVerified: user.isVerified 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last seen
    user.lastSeen = Date.now();
    await user.save();

    // Return user data
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        // Don't send sensitive data
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});