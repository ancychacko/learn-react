// routes/index.js
const express = require("express");
const router = express.Router();

// utils
const upload = require("../utils/multerConfig");

// controllers
const auth = require("../Controllers/auth");
const posts = require("../Controllers/posts");
const comments = require("../Controllers/comments");
const shares = require("../Controllers/shares");
const notifications = require("../Controllers/notifications");
const following = require("../Controllers/following");
const messages = require("../Controllers/messages");

// ------------------------------
// AUTH
// ------------------------------
router.post("/Register", auth.register);
router.post("/Login", auth.login);
router.get("/me", auth.me);
router.post("/Logout", auth.logout);
router.post("/Profile", upload.single("avatar"), auth.updateProfile);

// ------------------------------
// POSTS
// ------------------------------
router.post("/CreatePost", upload.single("media"), posts.createPost);
router.get("/Posts", posts.getPosts);
router.get("/posts/:id", posts.getSinglePost);
router.post("/Posts/:id/like", posts.toggleLike);
router.put("/posts/:id", upload.single("media"), posts.editPost);
router.delete("/posts/:id", posts.deletePost);

// ------------------------------
// COMMENTS
// ------------------------------
router.post("/posts/:id/comments", comments.postComment);
router.get("/posts/:id/comments", comments.getComments);
router.post("/comments/:id/like", comments.toggleLike);
router.put("/comments/:id", comments.editComment);
router.delete("/comments/:id", comments.deleteComment);

// ------------------------------
// SHARES (Send, Share to feed, Reshare with thoughts)
// ------------------------------
router.post("/posts/:id/share", shares.sharePost);

// ------------------------------
// FOLLOWING
// ------------------------------
router.get("/following", following.getFollowing);

// ------------------------------
// NOTIFICATIONS
// ------------------------------
router.get("/notifications", notifications.getNotifications);
router.post("/notifications/:id/read", notifications.markRead);
router.get("/notifications/unread_count", notifications.unreadCount);
router.delete("/notifications/:id/delete", notifications.deleteNotification);
router.post("/notifications/mute/:actorId", notifications.muteActor);
router.delete("/notifications/mute/:actorId", notifications.unmuteActor);

// ------------------------------
// MESSAGING  ⭐ NEW ⭐
// ------------------------------

// Send message (text + file + post attachment)
router.post(
  "/messages/send",
  messages.upload.single("attachment"),
  messages.sendMessage
);

// Get user conversations
router.get("/messages/conversations", messages.getConversations);

// Get chat messages between me & another user
router.get("/messages/:userId", messages.getChat);

module.exports = router;
