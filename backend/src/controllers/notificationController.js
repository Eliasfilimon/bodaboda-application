import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { type, id } = req.auth;
    const where = type === 'rider' ? { riderId: id } : { userId: id };
    const notifications = await Notification.findAll({ where, order: [['createdAt', 'DESC']], limit: 50 });
    res.json(notifications);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const markRead = async (req, res) => {
  try {
    const { type, id } = req.auth;
    const where = type === 'rider' ? { riderId: id } : { userId: id };
    await Notification.update({ read: true }, { where });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const markOneRead = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Not found' });
    await notif.update({ read: true });
    res.json(notif);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Not found' });
    await notif.destroy();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const pushNotification = async (io, { userId, riderId, type = 'info', title, body, tripId }) => {
  try {
    const notif = await Notification.create({ userId, riderId, type, title, body, tripId });
    const room = userId ? `user:${userId}` : `rider:${riderId}`;
    if (io) io.to(room).emit('new_notification', notif.toJSON());
    return notif;
  } catch (err) { console.error('pushNotification error:', err.message); }
};
