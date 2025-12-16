// // utils/createNotification.js
// // const pool = require("../Database/pool");

// // module.exports = async function createNotification({
// //   recipientId,
// //   actorId = null,
// //   type,
// //   postId = null,
// //   commentId = null,
// //   shareId = null,
// //   data = {},
// // }) {
// //   try {
// //     await pool.query(
// //       `
// //       INSERT INTO notifications
// //       (recipient_id, actor_id, type, post_id, comment_id, share_id, data)
// //       VALUES ($1, $2, $3, $4, $5, $6, $7)
// //       `,
// //       [
// //         recipientId,
// //         actorId,
// //         type,
// //         postId,
// //         commentId,
// //         shareId,
// //         JSON.stringify(data),
// //       ]
// //     );
// //   } catch (err) {
// //     console.error("createNotification() failed:", err);
// //   }
// // };

// // utils/createNotification.js
// const pool = require("../Database/pool");

// module.exports = async function createNotification({
//   recipientId,
//   actorId = null,
//   type,
//   postId = null, // <- Original post ID MUST be passed here for share
//   commentId = null,
//   shareId = null,
//   data = {},
// }) {
//   try {
//     await pool.query(
//       `
//       INSERT INTO notifications
//       (recipient_id, actor_id, type, post_id, comment_id, share_id,data)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       `,
//       [
//         recipientId,
//         actorId,
//         type,
//         postId, // MUST CONTAIN original_post_id for shares
//         commentId,
//         shareId,
//         JSON.stringify(data),
//       ]
//     );
//   } catch (err) {
//     console.error("createNotification() failed:", err);
//   }
// };

// utils/createNotification.js
const pool = require("../Database/pool");

module.exports = async function createNotification({
  recipientId,
  actorId = null,
  type,
  postId = null,
  commentId = null,
  shareId = null,
  data = {},
}) {
  // Validation and debugging
  console.log("createNotification called with:", {
    recipientId,
    actorId,
    type,
    postId,
    commentId,
    shareId,
    data,
  });

  // Validate required fields
  if (!recipientId) {
    const error = new Error("recipientId is required for notifications");
    console.error("createNotification validation error:", error.message);
    throw error;
  }

  if (!type) {
    const error = new Error("type is required for notifications");
    console.error("createNotification validation error:", error.message);
    throw error;
  }

  try {
    const result = await pool.query(
      `INSERT INTO notifications
       (recipient_id, actor_id, type, post_id, comment_id, share_id, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        recipientId,
        actorId,
        type,
        postId,
        commentId,
        shareId,
        JSON.stringify(data),
      ]
    );

    console.log(
      `✅ Notification created successfully with ID: ${result.rows[0].id}`
    );
    return result.rows[0].id;
  } catch (err) {
    console.error("❌ createNotification() failed:", err);
    console.error("Failed with params:", {
      recipientId,
      actorId,
      type,
      postId,
      commentId,
      shareId,
    });
    throw err; // Re-throw so caller knows it failed
  }
};
