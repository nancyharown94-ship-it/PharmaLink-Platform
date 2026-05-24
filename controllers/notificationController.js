const Notification = require('../models/notificationModel');

const getNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { readStatus: true },
            { returnDocument: 'after' }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Internal helper for triggering notifications across backend controllers
const triggerNotification = async (userId, message) => {
    try {
        const notification = new Notification({
            userId,
            message
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Failed to trigger notification:', error);
    }
};

module.exports = {
    getNotificationsByUserId,
    markNotificationAsRead,
    triggerNotification
};
