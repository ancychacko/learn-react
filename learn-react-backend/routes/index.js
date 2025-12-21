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
const network = require("../Controllers/network");

// ----------------------------------------
// 🔒 AUTH MIDDLEWARE
// ----------------------------------------
function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// ----------------------------------------
// AUTH  (Public)
// ----------------------------------------
router.post("/Register", auth.register);
router.post("/Login", auth.login);

// ❗ /me must be protected
router.get("/me", requireLogin, auth.me);

router.post("/Logout", requireLogin, auth.logout);
router.post(
  "/Profile",
  requireLogin,
  upload.single("avatar"),
  auth.updateProfile
);

// ----------------------------------------
// POSTS  (Protected)
// ----------------------------------------
router.post(
  "/CreatePost",
  requireLogin,
  upload.single("media"),
  posts.createPost
);
router.get("/Posts", requireLogin, posts.getPosts);
router.get("/posts/:id", requireLogin, posts.getSinglePost);
router.post("/Posts/:id/like", requireLogin, posts.toggleLike);
router.put("/posts/:id", requireLogin, upload.single("media"), posts.editPost);
router.delete("/posts/:id", requireLogin, posts.deletePost);

// ----------------------------------------
// COMMENTS  (Protected)
// ----------------------------------------
router.post("/posts/:id/comments", requireLogin, comments.postComment);
router.get("/posts/:id/comments", requireLogin, comments.getComments);
router.post("/comments/:id/like", requireLogin, comments.toggleLike);
router.put("/comments/:id", requireLogin, comments.editComment);
router.delete("/comments/:id", requireLogin, comments.deleteComment);

// ----------------------------------------
// SHARES (Send / Repost / Share to feed)
// ----------------------------------------
router.post("/posts/:id/share", requireLogin, shares.sharePost);

// ----------------------------------------
// FOLLOWING
// ----------------------------------------
router.get("/following", requireLogin, following.getFollowing);

// ----------------------------------------
// NOTIFICATIONS  (🔒 Protected)
// ----------------------------------------
router.get("/notifications", requireLogin, notifications.getNotifications);
router.post("/notifications/:id/read", requireLogin, notifications.markRead);
router.get(
  "/notifications/unread_count",
  requireLogin,
  notifications.unreadCount
);
router.delete(
  "/notifications/:id/delete",
  requireLogin,
  notifications.deleteNotification
);
router.post(
  "/notifications/mute/:actorId",
  requireLogin,
  notifications.muteActor
);
router.delete(
  "/notifications/mute/:actorId",
  requireLogin,
  notifications.unmuteActor
);

// ----------------------------------------
// MESSAGING (🔒 Protected)
// ----------------------------------------
router.post(
  "/messages/send",
  requireLogin,
  messages.upload.single("attachment"),
  messages.sendMessage
);
// Get all conversations for current user
router.get("/messages/conversations", requireLogin, messages.getConversations);

// Get chat messages with a specific user
router.get("/messages/chat/:userId", requireLogin, messages.getChat);

// Search connections for messaging
router.get(
  "/network/connections/search",
  requireLogin,
  network.searchConnections
);

// Delete a message (optional)
router.delete("/messages/:messageId", requireLogin, messages.deleteMessage);

// ----------------------------------------
//NETWORKING ROUTES (🔒 Protected)

// Get pending invitations
router.get("/network/invitations", requireLogin, network.getInvitations);
// Get people suggestions
router.get("/network/suggestions", requireLogin, network.getSuggestions);
// Get user's connections
router.get("/network/connections", requireLogin, network.getConnections);
// Get connections count
router.get(
  "/network/connections/count",
  requireLogin,
  network.getConnectionsCount
);
// Send connection request
router.post("/network/connect", requireLogin, network.sendConnectionRequest);
// Accept connection request
router.post("/network/accept", requireLogin, network.acceptConnection);
// Reject connection request
router.post("/network/reject", requireLogin, network.rejectConnection);
// Accept connection by requester ID (for notifications)
router.post(
  "/network/accept-by-requester",
  requireLogin,
  network.acceptConnectionByRequester
);
// Reject connection by requester ID (for notifications)
router.post(
  "/network/reject-by-requester",
  requireLogin,
  network.rejectConnectionByRequester
);

// Get sent invitations
router.get(
  "/network/sent-invitations",
  requireLogin,
  network.getSentInvitations
);
// Withdraw sent invitation
router.post("/network/withdraw", requireLogin, network.withdrawInvitation);

// Get catch-up updates
router.get("/network/catchup", requireLogin, network.getCatchUpUpdates);

// Remove connection
router.post("/network/remove", requireLogin, network.removeConnection);

// Block user
router.post("/network/block", requireLogin, network.blockUser);

// Unblock user
router.post("/network/unblock", requireLogin, network.unblockUser);

// Search connections (for messaging)
router.get(
  "/network/connections/search",
  requireLogin,
  network.searchConnections
);

// Report user
router.post("/network/report", requireLogin, network.reportUser);

module.exports = router;
