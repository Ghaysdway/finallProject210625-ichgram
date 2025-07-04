import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("sender", "username avatar")
      .populate("post", "imageUrl videoUrl mediaType content")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotificationManually = async (req, res) => {
  try {
    const { userId, type, message } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      message,
    });

    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};

export const markSingleNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res
        .status(400)
        .json({ message: "Неверный формат ID уведомления" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId, read: false },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      const existingNotification = await Notification.findOne({
        _id: notificationId,
        user: userId,
      });
      if (existingNotification && existingNotification.read) {
        return res.status(200).json({
          message: "Уведомление уже было прочитано",
          notification: existingNotification,
        });
      }
      return res.status(404).json({
        message: "Уведомление не найдено или не принадлежит пользователю",
      });
    }

    res
      .status(200)
      .json({ message: "Уведомление помечено как прочитанное", notification });
  } catch (error) {
    console.error("Error marking single notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};
