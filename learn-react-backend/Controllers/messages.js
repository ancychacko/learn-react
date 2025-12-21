//Controllers/messages.js
// const pool = require("../Database/pool");
// const multer = require("multer");

// // -------------------------------
// // Multer for messaging attachments
// // -------------------------------
// const upload = multer({
//   dest: "uploads/messages/",
// });

// // -------------------------------
// // Helper: ensure conversation exists
// // -------------------------------
// async function getConversation(user1, user2) {
//   const a = Math.min(user1, user2);
//   const b = Math.max(user1, user2);

//   const r = await pool.query(
//     `
//     INSERT INTO conversations (user1_id, user2_id)
//     VALUES ($1, $2)
//     ON CONFLICT (user1_id, user2_id)
//       DO UPDATE SET user1_id = EXCLUDED.user1_id
//     RETURNING id;
//     `,
//     [a, b]
//   );

//   return r.rows[0].id;
// }

// // -------------------------------
// // SEND MESSAGE
// // -------------------------------
// async function sendMessage(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const sender_id = req.session.userId;
//   const { receiver_id, receiverId, text, content, post_id } = req.body;

//   // Support both field name formats
//   const finalReceiverId = receiver_id || receiverId;
//   const finalText = text || content;

//   // Validate required fields
//   if (!finalReceiverId) {
//     return res
//       .status(400)
//       .json({ error: "receiver_id or receiverId is required" });
//   }

//   if (!finalText && !req.file && !post_id) {
//     return res
//       .status(400)
//       .json({ error: "Message must contain text, attachment, or post" });
//   }

//   try {
//     const conversation_id = await getConversation(sender_id, finalReceiverId);

//     let attachment_url = null;
//     let attachment_type = null;

//     if (req.file) {
//       attachment_url = `/uploads/messages/${req.file.filename}`;

//       const type = req.file.mimetype;
//       if (type.startsWith("image/")) attachment_type = "image";
//       else if (type.startsWith("video/")) attachment_type = "video";
//       else attachment_type = "file";
//     }

//     const r = await pool.query(
//       `
//       INSERT INTO messages (
//         conversation_id,
//         sender_id,
//         receiver_id,
//         text,
//         attachment_url,
//         attachment_type,
//         post_id
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *;
//       `,
//       [
//         conversation_id,
//         sender_id,
//         finalReceiverId,
//         finalText || null,
//         attachment_url,
//         attachment_type,
//         post_id || null,
//       ]
//     );

//     res.json({ ok: true, message: r.rows[0] });
//   } catch (err) {
//     console.error("sendMessage error:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// }

// // -------------------------------
// // GET CONVERSATIONS
// // -------------------------------
// async function getConversations(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const me = req.session.userId;

//   try {
//     const r = await pool.query(
//       `
//       SELECT
//         c.id AS conversation_id,

//         u.id AS user_id,
//         u.name AS name,
//         u.avatar_url AS avatar_url,

//         (
//           SELECT text
//           FROM messages m
//           WHERE m.conversation_id = c.id
//           ORDER BY created_at DESC
//           LIMIT 1
//         ) AS last_message,

//         (
//           SELECT created_at
//           FROM messages m
//           WHERE m.conversation_id = c.id
//           ORDER BY created_at DESC
//           LIMIT 1
//         ) AS last_message_time,

//         (
//           SELECT post_id
//           FROM messages m
//           WHERE m.conversation_id = c.id
//           ORDER BY created_at DESC
//           LIMIT 1
//         ) AS last_message_post

//       FROM conversations c
//       JOIN users u
//         ON (u.id = c.user1_id AND c.user2_id = $1)
//         OR (u.id = c.user2_id AND c.user1_id = $1)

//       WHERE EXISTS (
//         SELECT 1 FROM messages m WHERE m.conversation_id = c.id
//       )

//       ORDER BY (
//         SELECT created_at
//         FROM messages m
//         WHERE m.conversation_id = c.id
//         ORDER BY created_at DESC
//         LIMIT 1
//       ) DESC NULLS LAST;
//       `,
//       [me]
//     );

//     res.json(r.rows);
//   } catch (err) {
//     console.error("getConversations error:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// }

// // -------------------------------
// // GET MESSAGES FOR A USER (CHAT)
// // -------------------------------
// async function getChat(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const me = req.session.userId;
//   const otherId = Number(req.params.userId);

//   if (!otherId || isNaN(otherId)) {
//     return res.status(400).json({ error: "Invalid userId parameter" });
//   }

//   try {
//     const conversation_id = await getConversation(me, otherId);

//     const r = await pool.query(
//       `
//       SELECT
//         id,
//         sender_id,
//         receiver_id,
//         text AS message_text,
//         attachment_url,
//         attachment_type,
//         post_id,
//         created_at
//       FROM messages
//       WHERE conversation_id = $1
//       ORDER BY created_at ASC;
//       `,
//       [conversation_id]
//     );

//     res.json(r.rows);
//   } catch (err) {
//     console.error("getChat error:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// }

// // -------------------------------
// // SEARCH CONNECTIONS FOR MESSAGING
// // -------------------------------
// async function searchConnections(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const me = req.session.userId;
//   const { query } = req.query;

//   if (!query || query.trim().length === 0) {
//     return res.json([]);
//   }

//   try {
//     const searchTerm = `%${query.toLowerCase()}%`;

//     const r = await pool.query(
//       `
//       SELECT DISTINCT
//         u.id,
//         u.name,
//         u.title,
//         u.avatar_url
//       FROM users u
//       INNER JOIN connections c ON (
//         (c.requester_id = $1 AND c.receiver_id = u.id) OR
//         (c.receiver_id = $1 AND c.requester_id = u.id)
//       )
//       WHERE c.status = 'accepted'
//         AND LOWER(u.name) LIKE $2
//         AND u.id != $1
//       ORDER BY u.name ASC
//       LIMIT 10;
//       `,
//       [me, searchTerm]
//     );

//     res.json(r.rows);
//   } catch (err) {
//     console.error("searchConnections error:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// }

// // -------------------------------
// // DELETE MESSAGE (optional feature)
// // -------------------------------
// async function deleteMessage(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const me = req.session.userId;
//   const { messageId } = req.params;

//   try {
//     // Check if user is the sender
//     const checkResult = await pool.query(
//       `SELECT sender_id FROM messages WHERE id = $1`,
//       [messageId]
//     );

//     if (checkResult.rows.length === 0) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     if (checkResult.rows[0].sender_id !== me) {
//       return res
//         .status(403)
//         .json({ error: "Not authorized to delete this message" });
//     }

//     // Delete the message
//     await pool.query(`DELETE FROM messages WHERE id = $1`, [messageId]);

//     res.json({ ok: true, message: "Message deleted" });
//   } catch (err) {
//     console.error("deleteMessage error:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// }

// module.exports = {
//   upload,
//   sendMessage,
//   getConversations,
//   getChat,
//   searchConnections,
//   deleteMessage,
// };

const pool = require("../Database/pool");
const multer = require("multer");

// Multer for attachments
const upload = multer({
  dest: "uploads/messages/",
});

// Helper: Get or create conversation
async function getConversation(user1, user2) {
  const a = Math.min(user1, user2);
  const b = Math.max(user1, user2);

  const r = await pool.query(
    `
    INSERT INTO conversations (user1_id, user2_id)
    VALUES ($1, $2)
    ON CONFLICT (user1_id, user2_id)
      DO UPDATE SET user1_id = EXCLUDED.user1_id
    RETURNING id;
    `,
    [a, b]
  );

  return r.rows[0].id;
}

// SEND MESSAGE
async function sendMessage(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const sender_id = req.session.userId;
  const { receiver_id, text } = req.body;

  // Validate
  if (!receiver_id) {
    return res.status(400).json({ error: "receiver_id is required" });
  }

  if (!text && !req.file) {
    return res
      .status(400)
      .json({ error: "Message text or attachment required" });
  }

  try {
    const conversation_id = await getConversation(sender_id, receiver_id);

    let attachment_url = null;
    let attachment_type = null;

    if (req.file) {
      attachment_url = `/uploads/messages/${req.file.filename}`;
      const type = req.file.mimetype;
      if (type.startsWith("image/")) attachment_type = "image";
      else if (type.startsWith("video/")) attachment_type = "video";
      else attachment_type = "file";
    }

    const r = await pool.query(
      `
      INSERT INTO messages (
        conversation_id,
        sender_id,
        receiver_id,
        text,
        attachment_url,
        attachment_type
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        conversation_id,
        sender_id,
        receiver_id,
        text || null,
        attachment_url,
        attachment_type,
      ]
    );

    res.json({ ok: true, message: r.rows[0] });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// GET CHAT MESSAGES WITH A USER
async function getChat(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const me = req.session.userId;
  const otherId = Number(req.params.userId);

  if (!otherId || isNaN(otherId)) {
    return res.status(400).json({ error: "Invalid userId parameter" });
  }

  try {
    const conversation_id = await getConversation(me, otherId);

    const r = await pool.query(
      `
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.text AS message_text,
        m.attachment_url,
        m.attachment_type,
        m.created_at,
        sender.name AS sender_name,
        sender.avatar_url AS sender_avatar_url
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC;
      `,
      [conversation_id]
    );

    res.json(r.rows);
  } catch (err) {
    console.error("getChat error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// GET ALL CONVERSATIONS
async function getConversations(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const me = req.session.userId;

  try {
    const r = await pool.query(
      `
      SELECT 
        c.id AS conversation_id,
        u.id AS user_id,
        u.name AS name,
        u.avatar_url AS avatar_url,
        (
          SELECT text 
          FROM messages m 
          WHERE m.conversation_id = c.id
          ORDER BY created_at DESC 
          LIMIT 1
        ) AS last_message,
        (
          SELECT created_at
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY created_at DESC 
          LIMIT 1
        ) AS last_message_time
      FROM conversations c
      JOIN users u
        ON (u.id = c.user1_id AND c.user2_id = $1)
        OR (u.id = c.user2_id AND c.user1_id = $1)
      WHERE EXISTS (
        SELECT 1 FROM messages m WHERE m.conversation_id = c.id
      )
      ORDER BY (
        SELECT created_at 
        FROM messages m 
        WHERE m.conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) DESC NULLS LAST;
      `,
      [me]
    );

    res.json(r.rows);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// -------------------------------
// DELETE MESSAGE (optional feature) // -------------------------------
async function deleteMessage(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const me = req.session.userId;
  const { messageId } = req.params;

  try {
    // Check if user is the sender
    const checkResult = await pool.query(
      `SELECT sender_id FROM messages WHERE id = $1`,
      [messageId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (checkResult.rows[0].sender_id !== me) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this message" });
    }

    // Delete the message
    await pool.query(`DELETE FROM messages WHERE id = $1`, [messageId]);

    res.json({ ok: true, message: "Message deleted" });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

module.exports = {
  upload,
  sendMessage,
  getConversations,
  getChat,
  deleteMessage,
};
