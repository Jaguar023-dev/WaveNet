const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.connect().catch(console.error);

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await client.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original send function
      const originalSend = res.json;
      
      res.json = function(data) {
        // Cache the response
        client.setEx(key, duration, JSON.stringify(data));
        
        // Call original send
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

const clearCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const keys = await client.keys(`cache:${pattern}*`);
      if (keys.length > 0) {
        await client.del(keys);
      }
      next();
    } catch (error) {
      console.error('Clear cache error:', error);
      next();
    }
  };
};

module.exports = { cacheMiddleware, clearCache };