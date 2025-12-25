// client/src/services/FriendshipService.js

const STORAGE_KEYS = {
  FRIENDSHIPS: 'wavenet_friendships',
  FRIEND_REQUESTS: 'wavenet_friend_requests'
};

class FriendshipService {
  constructor() {
    this.initDefaultData();
  }

  initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) {
      localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify([]));
    }
  }

  // Send friend request
  sendFriendRequest(fromUserId, toUserId) {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS)) || [];
    
    // Check if request already exists
    const existingRequest = requests.find(
      req => req.fromUserId === fromUserId && req.toUserId === toUserId
    );
    
    if (existingRequest) return existingRequest;
    
    const request = {
      id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
    
    return request;
  }

  // Accept friend request
  acceptFriendRequest(requestId) {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS)) || [];
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) return null;
    
    const request = requests[requestIndex];
    
    // Update request status
    requests[requestIndex] = { ...request, status: 'accepted' };
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
    
    // Create friendship
    this.createFriendship(request.fromUserId, request.toUserId);
    
    // Create auto-message
    import('./MessageService').then(MessageService => {
      MessageService.default.createFriendshipMessage(request.fromUserId, request.toUserId);
    }).catch(() => {
      // MessageService might not be loaded yet
      setTimeout(() => {
        import('./MessageService').then(MessageService => {
          MessageService.default.createFriendshipMessage(request.fromUserId, request.toUserId);
        });
      }, 1000);
    });
    
    return request;
  }

  // Create friendship
  createFriendship(user1Id, user2Id) {
    const friendships = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) || [];
    
    // Check if friendship already exists
    const existingFriendship = friendships.find(
      friendship => 
        (friendship.user1Id === user1Id && friendship.user2Id === user2Id) ||
        (friendship.user1Id === user2Id && friendship.user2Id === user1Id)
    );
    
    if (existingFriendship) return existingFriendship;
    
    const friendship = {
      id: `friendship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user1Id,
      user2Id,
      status: 'accepted',
      createdAt: new Date().toISOString()
    };
    
    friendships.push(friendship);
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(friendships));
    
    return friendship;
  }

  // Get pending friend requests for user
  getPendingRequests(userId) {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS)) || [];
    return requests.filter(req => req.toUserId === userId && req.status === 'pending');
  }

  // Get friendships for user
  getFriendships(userId) {
    const friendships = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) || [];
    return friendships.filter(
      friendship => 
        (friendship.user1Id === userId || friendship.user2Id === userId) &&
        friendship.status === 'accepted'
    );
  }

  // Check if users are friends
  areFriends(user1Id, user2Id) {
    const friendships = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) || [];
    return friendships.some(
      friendship => 
        (friendship.user1Id === user1Id && friendship.user2Id === user2Id) ||
        (friendship.user1Id === user2Id && friendship.user2Id === user1Id)
    ) && friendship.status === 'accepted';
  }

  // Remove friendship
  removeFriendship(friendshipId) {
    const friendships = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) || [];
    const filtered = friendships.filter(friendship => friendship.id !== friendshipId);
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(filtered));
  }
}

export default new FriendshipService();