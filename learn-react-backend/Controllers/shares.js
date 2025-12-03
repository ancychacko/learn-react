// Controllers/shares.js (FINAL UPDATED VERSION)
const pool = require("../Database/pool");
const createNotification = require("../utils/createNotification");

/**
 * POST /api/posts/:id/share
 * body:
 * {
 *   recipients: [],
 *   share_to_feed: boolean,
 *   comment: "reshare thoughts"
 * }
 */
// async function sharePost(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const userId = req.session.userId;
//   const postId = Number(req.params.id);

//   const {
//     recipients = [],
//     share_to_feed = false,
//     comment = "",
//   } = req.body || {};

//   try {
//     // 1) CREATE SHARE RECORD
//     const shareInsert = await pool.query(
//       `INSERT INTO shares (post_id, user_id)
//        VALUES ($1, $2)
//        RETURNING id, created_at`,
//       [postId, userId]
//     );
//     const shareId = shareInsert.rows[0].id;

//     // 2) SAVE SHARE RECIPIENTS
//     const validRecipients = Array.from(
//       new Set((recipients || []).map((r) => Number(r)).filter(Boolean))
//     );

//     if (validRecipients.length > 0) {
//       await Promise.all(
//         validRecipients.map((rid) =>
//           pool.query(
//             `INSERT INTO shares_recipients (share_id, recipient_id)
//              VALUES ($1, $2) ON CONFLICT DO NOTHING`,
//             [shareId, rid]
//           )
//         )
//       );

//       // Notify recipients
//       await Promise.all(
//         validRecipients.map((rid) =>
//           createNotification({
//             recipientId: rid,
//             actorId: userId,
//             type: "sent",
//             postId,
//             shareId,
//             data: { comment },
//           })
//         )
//       );
//     }

//     // 3) Notify ORIGINAL post owner
//     const ownerRes = await pool.query(`SELECT user_id FROM posts WHERE id=$1`, [
//       postId,
//     ]);

//     if (ownerRes.rows.length) {
//       const ownerId = ownerRes.rows[0].user_id;
//       if (ownerId !== userId) {
//         await createNotification({
//           recipientId: ownerId,
//           actorId: userId,
//           type: "share",
//           postId,
//           shareId,
//           data: { comment },
//         });
//       }
//     }

//     // 4) SHARE TO FEED — LinkedIn style
//     if (share_to_feed) {
//       // DO NOT copy original media
//       await pool.query(
//         `INSERT INTO posts (
//            user_id,
//            content,
//            media_url,
//            media_type,
//            visibility,
//            is_share,
//            original_post_id
//          )
//          VALUES ($1, $2, NULL, NULL, 'Anyone', true, $3)`,
//         [
//           userId,
//           comment || "",
//           postId, // link to original
//         ]
//       );
//     }

//     // 5) Return share count
//     const countRes = await pool.query(
//       `SELECT COUNT(*)::int AS count FROM shares WHERE post_id=$1`,
//       [postId]
//     );

//     return res.json({
//       ok: true,
//       share_id: shareId,
//       count: countRes.rows[0].count,
//     });
//   } catch (err) {
//     console.error("share error", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// }
async function sharePost(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const userId = req.session.userId;
  const postId = Number(req.params.id);

  const { recipients = [], share_to_feed = false, comment = "" } = req.body;

  try {
    const shareInsert = await pool.query(
      `INSERT INTO shares (post_id, user_id)
       VALUES ($1, $2)
       RETURNING id`,
      [postId, userId]
    );

    const shareId = shareInsert.rows[0].id;

    const validRecipients = Array.from(
      new Set(recipients.map((r) => Number(r)).filter(Boolean))
    );

    if (validRecipients.length > 0) {
      await Promise.all(
        validRecipients.map((rid) =>
          pool.query(
            `INSERT INTO shares_recipients (share_id, recipient_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [shareId, rid]
          )
        )
      );

      await Promise.all(
        validRecipients.map((rid) =>
          createNotification({
            recipientId: rid,
            actorId: userId,
            type: "sent",
            postId,
            shareId,
            data: { comment },
          })
        )
      );
    }

    const ownerRes = await pool.query("SELECT user_id FROM posts WHERE id=$1", [
      postId,
    ]);

    if (ownerRes.rows.length) {
      const ownerId = ownerRes.rows[0].user_id;
      if (ownerId !== userId) {
        await createNotification({
          recipientId: ownerId,
          actorId: userId,
          type: "share",
          postId,
          shareId,
          data: { comment },
        });
      }
    }

    if (share_to_feed) {
      //const contentText = (comment || "").trim();
      const visibilityValue = req.body.visibility || "Anyone";

      await pool.query(
        `INSERT INTO posts (user_id, content, media_url, media_type, visibility, is_share, original_post_id)
         VALUES ($1, $2, NULL, NULL, $3, true, $4)`,
        [userId, comment, visibilityValue, postId]
      );
    }

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM shares WHERE post_id=$1`,
      [postId]
    );

    res.json({ ok: true, share_id: shareId, count: countRes.rows[0].count });
  } catch (err) {
    console.error("share error", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { sharePost };
