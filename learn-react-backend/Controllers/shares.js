// controllers/shares.js
const pool = require("../Database/pool");
const createNotification = require("../utils/createNotification");

/**
 * POST /api/posts/:id/share
 * body: { recipients: [ids], share_to_feed: boolean, comment: optional text (reshare with thoughts) }
 */
async function sharePost(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const userId = req.session.userId;
  const postId = parseInt(req.params.id, 10);
  const {
    recipients = [],
    share_to_feed = false,
    comment = null,
  } = req.body || {};

  try {
    // create share row
    const insert = await pool.query(
      "INSERT INTO shares (post_id, user_id) VALUES ($1, $2) RETURNING id, created_at",
      [postId, userId]
    );
    const shareId = insert.rows[0].id;

    // save recipients mapping
    if (Array.isArray(recipients) && recipients.length) {
      const uniq = Array.from(
        new Set(recipients.map((r) => parseInt(r, 10)).filter(Boolean))
      );
      const vals = uniq.map((rid) =>
        pool.query(
          "INSERT INTO shares_recipients (share_id, recipient_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [shareId, rid]
        )
      );
      await Promise.all(vals);

      // create notification rows for recipients
      const notifPromises = uniq.map((rid) =>
        createNotification({
          recipientId: rid,
          actorId: userId,
          type: "sent",
          postId,
          shareId,
          data: { comment },
        })
      );
      await Promise.all(notifPromises);
    }

    // notify post owner (if not same)
    const postOwnerRes = await pool.query(
      "SELECT user_id FROM posts WHERE id=$1",
      [postId]
    );
    if (postOwnerRes.rows.length) {
      const ownerId = postOwnerRes.rows[0].user_id;
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

    // optionally reshare to feed (create a new post from original + optional comment)
    if (share_to_feed) {
      const original = await pool.query(
        "SELECT content, media_url, media_type, visibility FROM posts WHERE id=$1",
        [postId]
      );
      if (original.rows.length) {
        const orig = original.rows[0];
        const newContent = comment
          ? `${comment}\n\nShared: ${orig.content || ""}`
          : `Shared: ${orig.content || ""}`;
        await pool.query(
          "INSERT INTO posts (user_id, content, media_url, media_type, visibility) VALUES ($1, $2, $3, $4, $5)",
          [
            userId,
            newContent,
            orig.media_url,
            orig.media_type,
            orig.visibility || "Anyone",
          ]
        );
      }
    }

    // recalc share count
    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM shares WHERE post_id=$1",
      [postId]
    );
    res.json({ ok: true, count: countRes.rows[0].count, share_id: shareId });
  } catch (err) {
    console.error("share err", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { sharePost };
