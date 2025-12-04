// //Controllers/messages.js
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
//   const { receiver_id, text, post_id } = req.body;

//   try {
//     const conversation_id = await getConversation(sender_id, receiver_id);

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
//         receiver_id,
//         text || null,
//         attachment_url,
//         attachment_type,
//         post_id || null,
//       ]
//     );

//     res.json({ ok: true, message: r.rows[0] });
//   } catch (err) {
//     console.error("sendMessage error", err);
//     res.status(500).json({ error: "Server error" });
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
//       SELECT c.id,
//              u.id AS other_id,
//              u.name AS other_name,
//              u.avatar_url,
//              (
//                SELECT text
//                FROM messages m
//                WHERE m.conversation_id = c.id
//                ORDER BY created_at DESC
//                LIMIT 1
//              ) AS last_message,
//              (
//                SELECT post_id
//                FROM messages m
//                WHERE m.conversation_id = c.id
//                ORDER BY created_at DESC
//                LIMIT 1
//              ) AS last_message_post
//       FROM conversations c
//       JOIN users u
//         ON (u.id = c.user1_id AND c.user2_id = $1)
//         OR (u.id = c.user2_id AND c.user1_id = $1)
//       ORDER BY c.id DESC;
//       `,
//       [me]
//     );

//     res.json(r.rows);
//   } catch (err) {
//     console.error("getConversations error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }

// // -------------------------------
// // GET MESSAGES FOR A USER
// // -------------------------------
// async function getChat(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const me = req.session.userId;
//   const otherId = Number(req.params.userId);

//   try {
//     const conversation_id = await getConversation(me, otherId);

//     const r = await pool.query(
//       `
//       SELECT *
//       FROM messages
//       WHERE conversation_id = $1
//       ORDER BY created_at ASC;
//       `,
//       [conversation_id]
//     );

//     res.json(r.rows);
//   } catch (err) {
//     console.error("getChat error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }

// module.exports = {
//   upload,
//   sendMessage,
//   getConversations,
//   getChat,
// };

//Controllers/messages.js

const pool = require("../Database/pool");
const multer = require("multer");

// -------------------------------
// Multer for messaging attachments
// -------------------------------
const upload = multer({
  dest: "uploads/messages/",
});

// -------------------------------
// Helper: ensure conversation exists
// -------------------------------
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

// -------------------------------
// SEND MESSAGE
// -------------------------------
async function sendMessage(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const sender_id = req.session.userId;
  const { receiver_id, text, post_id } = req.body;

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
        attachment_type,
        post_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        conversation_id,
        sender_id,
        receiver_id,
        text || null,
        attachment_url,
        attachment_type,
        post_id || null,
      ]
    );

    res.json({ ok: true, message: r.rows[0] });
  } catch (err) {
    console.error("sendMessage error", err);
    res.status(500).json({ error: "Server error" });
  }
}

// -------------------------------
// GET CONVERSATIONS
// -------------------------------
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
          SELECT post_id
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY created_at DESC 
          LIMIT 1
        ) AS last_message_post

      FROM conversations c
      JOIN users u
        ON (u.id = c.user1_id AND c.user2_id = $1)
        OR (u.id = c.user2_id AND c.user1_id = $1)

      ORDER BY c.id DESC;
      `,
      [me]
    );

    res.json(r.rows);
  } catch (err) {
    console.error("getConversations error", err);
    res.status(500).json({ error: "Server error" });
  }
}

// -------------------------------
// GET MESSAGES FOR A USER
// -------------------------------
async function getChat(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const me = req.session.userId;
  const otherId = Number(req.params.userId);

  try {
    const conversation_id = await getConversation(me, otherId);

    const r = await pool.query(
      `
      SELECT 
        id,
        sender_id,
        receiver_id,
        text AS message_text,
        attachment_url,
        attachment_type,
        post_id,
        created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC;
      `,
      [conversation_id]
    );

    res.json(r.rows);
  } catch (err) {
    console.error("getChat error", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  upload,
  sendMessage,
  getConversations,
  getChat,
};
