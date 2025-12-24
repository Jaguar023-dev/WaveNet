// server/utils/notificationHelpers.js
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationHelper {
  // Send verification request notification to admins
  static async sendVerificationRequestNotification(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Find all admins
      const admins = await User.find({ 
        role: { $in: ['admin', 'super_admin'] },
        _id: { $ne: userId } // Don't notify if user is also admin
      });

      // Create notifications for each admin
      const notifications = await Promise.all(
        admins.map(admin => 
          Notification.createVerificationNotification({
            recipient: admin._id,
            sender: userId,
            type: 'verification_review_required',
            message: `${user.username} has submitted a verification request`,
            link: `/admin/verification`,
            metadata: {
              userId: user._id,
              username: user.username,
              requestType: 'verification',
              action: 'review_required'
            }
          })
        )
      );

      console.log(`Sent verification request notifications to ${admins.length} admins`);
      return notifications;
    } catch (error) {
      console.error('Error sending verification request notifications:', error);
      throw error;
    }
  }

  // Send verification approved notification to user
  static async sendVerificationApprovedNotification(userId, approvedBy) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const admin = await User.findById(approvedBy);
      if (!admin) throw new Error('Admin not found');

      const notification = await Notification.createVerificationNotification({
        recipient: userId,
        sender: approvedBy,
        type: 'verification_approved',
        message: 'Congratulations! Your account has been verified.',
        link: `/profile/${userId}`,
        metadata: {
          verifiedSince: new Date(),
          verifiedBy: admin._id,
          verifiedByUsername: admin.username,
          verificationType: user.verificationType
        }
      });

      console.log(`Sent verification approved notification to ${user.username}`);
      return notification;
    } catch (error) {
      console.error('Error sending verification approved notification:', error);
      throw error;
    }
  }

  // Send verification rejected notification to user
  static async sendVerificationRejectedNotification(userId, rejectedBy, reason) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const admin = await User.findById(rejectedBy);
      if (!admin) throw new Error('Admin not found');

      const notification = await Notification.createVerificationNotification({
        recipient: userId,
        sender: rejectedBy,
        type: 'verification_rejected',
        message: `Your verification request was not approved. Reason: ${reason}`,
        link: `/verification`,
        metadata: {
          rejectedAt: new Date(),
          rejectedBy: admin._id,
          rejectedByUsername: admin.username,
          rejectionReason: reason,
          canReapplyAfter: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        }
      });

      console.log(`Sent verification rejected notification to ${user.username}`);
      return notification;
    } catch (error) {
      console.error('Error sending verification rejected notification:', error);
      throw error;
    }
  }

  // Send notification to admin who approved verification
  static async sendVerificationApprovedAdminNotification(adminId, userId) {
    try {
      const admin = await User.findById(adminId);
      const user = await User.findById(userId);
      
      if (!admin || !user) throw new Error('User not found');

      const notification = await Notification.createVerificationNotification({
        recipient: adminId,
        sender: userId,
        type: 'verification_approved_admin',
        message: `You approved ${user.username}'s verification request`,
        link: `/admin/verification`,
        metadata: {
          approvedAt: new Date(),
          approvedUserId: user._id,
          approvedUsername: user.username,
          verificationType: user.verificationType
        }
      });

      console.log(`Sent admin approval notification to ${admin.username}`);
      return notification;
    } catch (error) {
      console.error('Error sending admin approval notification:', error);
      throw error;
    }
  }

  // Send verification reminder to user
  static async sendVerificationReminder(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const notification = await Notification.createVerificationNotification({
        recipient: userId,
        type: 'verification_reminder',
        message: 'Complete your verification to get the blue badge',
        link: `/verification`,
        metadata: {
          reminderType: 'verification_incomplete',
          sentAt: new Date(),
          action: 'complete_verification'
        }
      });

      console.log(`Sent verification reminder to ${user.username}`);
      return notification;
    } catch (error) {
      console.error('Error sending verification reminder:', error);
      throw error;
    }
  }

  // Get verification notifications for a user
  static async getUserVerificationNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.find({
        recipient: userId,
        type: {
          $in: [
            'verification_approved',
            'verification_rejected',
            'verification_reminder'
          ]
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username profilePicture')
      .lean();

      return notifications;
    } catch (error) {
      console.error('Error getting verification notifications:', error);
      throw error;
    }
  }

  // Get pending verification notifications for admin
  static async getAdminVerificationNotifications(adminId, limit = 50) {
    try {
      const notifications = await Notification.find({
        recipient: adminId,
        type: {
          $in: [
            'verification_review_required',
            'verification_approved_admin'
          ]
        },
        read: false
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username profilePicture')
      .lean();

      return notifications;
    } catch (error) {
      console.error('Error getting admin verification notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationHelper;