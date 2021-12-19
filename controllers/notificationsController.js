const Notification = require("../models/notification");
const User = require("../models/user");

exports.index = function (req, res, next) {
  res.json({ msg: "notifications index response" });
};

exports.notification_DELETE = async (req, res) => {
  const notificationId = req.params.notificationId;
  const { userId } = req.body;

  try {
    const notification = await Notification.findById(notificationId);
    const currentUser = await User.findById(userId);

    if (!notification) {
      return res.status(400).json({
        success: false,
        msg: "Can not find notification",
      });
    } else if (!currentUser) {
      return res.status(400).json({
        success: false,
        msg: "Can not find current user",
      });
    } else if (!currentUser.notifications.includes(notificationId)) {
      return res.status(400).json({
        success: false,
        msg: "This is not your notification",
      });
    }

    // if everything is ok, delete notification and delete it from user.notifications

    await notification.remove();
    const updatedNotifications = currentUser.notifications.filter(
      (item) => item != notificationId.toString()
    );

    currentUser.notifications = updatedNotifications;
    const updatedUser = await currentUser.save();

    return res.status(200).json({
      success: true,
      updatedUser: updatedUser,
      msg: "Notification deleted",
    });
  } catch (err) {
    return res.status(400).json({ success: false, msg: err.message });
  }
};
