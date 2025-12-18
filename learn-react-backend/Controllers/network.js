// Controllers/network.js
// const pool = require("../Database/pool");
// const createNotification = require("../utils/createNotification");

// // Get pending connection invitations
// exports.getInvitations = async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     const result = await pool.query(
//       `SELECT
//         c.id,
//         c.requester_id,
//         c.created_at,
//         u.name,
//         u.title,
//         u.avatar_url
//       FROM connections c
//       JOIN users u ON u.id = c.requester_id
//       WHERE c.receiver_id = $1 AND c.status = 'pending'
//       ORDER BY c.created_at DESC`,
//       [userId]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error fetching invitations:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Get people suggestions
// exports.getSuggestions = async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     // Get users who are not already connected and not the current user
//     const result = await pool.query(
//       `SELECT
//         u.id,
//         u.name,
//         u.title,
//         u.avatar_url,
//         COUNT(DISTINCT c1.id) as mutual_connections
//       FROM users u
//       LEFT JOIN connections c1 ON (
//         (c1.requester_id = u.id OR c1.receiver_id = u.id)
//         AND c1.status = 'accepted'
//         AND (
//           c1.requester_id IN (
//             SELECT CASE
//               WHEN requester_id = $1 THEN receiver_id
//               ELSE requester_id
//             END
//             FROM connections
//             WHERE (requester_id = $1 OR receiver_id = $1)
//             AND status = 'accepted'
//           )
//           OR c1.receiver_id IN (
//             SELECT CASE
//               WHEN requester_id = $1 THEN receiver_id
//               ELSE requester_id
//             END
//             FROM connections
//             WHERE (requester_id = $1 OR receiver_id = $1)
//             AND status = 'accepted'
//           )
//         )
//       )
//       WHERE u.id != $1
//       AND u.id NOT IN (
//         SELECT CASE
//           WHEN requester_id = $1 THEN receiver_id
//           ELSE requester_id
//         END
//         FROM connections
//         WHERE (requester_id = $1 OR receiver_id = $1)
//         AND (status = 'accepted' OR status = 'pending')
//       )
//       GROUP BY u.id, u.name, u.title, u.avatar_url
//       ORDER BY mutual_connections DESC, RANDOM()
//       LIMIT 10`,
//       [userId]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error fetching suggestions:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Send connection request
// exports.sendConnectionRequest = async (req, res) => {
//   try {
//     const requesterId = req.session.userId;
//     const { userId } = req.body;

//     console.log("sendConnectionRequest - requesterId:", requesterId);
//     console.log("sendConnectionRequest - userId (receiver):", userId);

//     if (!userId) {
//       return res.status(400).json({ error: "User ID required" });
//     }

//     // Convert to integer to ensure proper comparison
//     const receiverId = parseInt(userId);

//     if (requesterId === receiverId) {
//       return res.status(400).json({ error: "Cannot connect to yourself" });
//     }

//     // Check if connection already exists
//     const existingConnection = await pool.query(
//       `SELECT * FROM connections
//        WHERE (requester_id = $1 AND receiver_id = $2)
//        OR (requester_id = $2 AND receiver_id = $1)`,
//       [requesterId, receiverId]
//     );

//     if (existingConnection.rows.length > 0) {
//       return res.status(400).json({ error: "Connection already exists" });
//     }

//     // Create new connection request
//     const result = await pool.query(
//       `INSERT INTO connections (requester_id, receiver_id, status, created_at)
//        VALUES ($1, $2, 'pending', NOW())
//        RETURNING *`,
//       [requesterId, receiverId]
//     );

//     console.log("Connection created:", result.rows[0]);

//     // Create notification for the receiver
//     console.log("Creating notification for recipientId:", receiverId, "actorId:", requesterId);

//     try {
//       await createNotification({
//         recipientId: receiverId,      // Person receiving the connection request
//         actorId: requesterId,          // Person sending the request
//         type: "connection_request",
//         postId: null,
//         commentId: null,
//         shareId: null,
//         data: {},
//       });
//       console.log("Notification created successfully");
//     } catch (notifErr) {
//       console.error("createNotification() failed:", notifErr);
//       // Don't fail the request if notification fails
//     }

//     res.json({ success: true, connection: result.rows[0] });
//   } catch (err) {
//     console.error("Error sending connection request:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Accept connection request
// exports.acceptConnection = async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const { connectionId } = req.body;

//     console.log("acceptConnection - userId:", userId, "connectionId:", connectionId);

//     if (!connectionId) {
//       return res.status(400).json({ error: "Connection ID required" });
//     }

//     // Update connection status
//     const result = await pool.query(
//       `UPDATE connections
//        SET status = 'accepted', accepted_at = NOW()
//        WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
//        RETURNING *`,
//       [connectionId, userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Connection request not found" });
//     }

//     console.log("Connection accepted:", result.rows[0]);

//     // Create notification for the requester
//     console.log("Creating notification for recipientId:", result.rows[0].requester_id, "actorId:", userId);

//     try {
//       await createNotification({
//         recipientId: result.rows[0].requester_id,  // Original requester gets notified
//         actorId: userId,                            // Person who accepted
//         type: "connection_accepted",
//         postId: null,
//         commentId: null,
//         shareId: null,
//         data: {},
//       });
//       console.log("Notification created successfully");
//     } catch (notifErr) {
//       console.error("createNotification() failed:", notifErr);
//       // Don't fail the request if notification fails
//     }

//     res.json({ success: true, connection: result.rows[0] });
//   } catch (err) {
//     console.error("Error accepting connection:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Reject/Remove connection request
// exports.rejectConnection = async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const { connectionId } = req.body;

//     if (!connectionId) {
//       return res.status(400).json({ error: "Connection ID required" });
//     }

//     // Delete connection
//     const result = await pool.query(
//       `DELETE FROM connections
//        WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
//        RETURNING *`,
//       [connectionId, userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Connection request not found" });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error rejecting connection:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Get user's connections count and details
// exports.getConnections = async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     const result = await pool.query(
//       `SELECT
//         u.id,
//         u.name,
//         u.title,
//         u.avatar_url,
//         c.created_at as connected_at
//       FROM connections c
//       JOIN users u ON (
//         CASE
//           WHEN c.requester_id = $1 THEN u.id = c.receiver_id
//           ELSE u.id = c.requester_id
//         END
//       )
//       WHERE (c.requester_id = $1 OR c.receiver_id = $1)
//       AND c.status = 'accepted'
//       ORDER BY c.created_at DESC`,
//       [userId]
//     );

//     res.json({
//       count: result.rows.length,
//       connections: result.rows,
//     });
//   } catch (err) {
//     console.error("Error fetching connections:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Get connections count only (for sidebar display)
// exports.getConnectionsCount = async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     const result = await pool.query(
//       `SELECT COUNT(*) as count
//        FROM connections
//        WHERE (requester_id = $1 OR receiver_id = $1)
//        AND status = 'accepted'`,
//       [userId]
//     );

//     res.json({ count: parseInt(result.rows[0].count) });
//   } catch (err) {
//     console.error("Error fetching connections count:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// Controllers/network.js
const pool = require("../Database/pool");
const createNotification = require("../utils/createNotification");

// Get pending connection invitations
exports.getInvitations = async (req, res) => {
  try {
    const userId = req.session.userId;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.requester_id,
        c.created_at,
        u.name,
        u.title,
        u.avatar_url
      FROM connections c
      JOIN users u ON u.id = c.requester_id
      WHERE c.receiver_id = $1 AND c.status = 'pending'
      ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching invitations:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get people suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get users who are not already connected and not the current user
    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.title,
        u.avatar_url,
        COUNT(DISTINCT c1.id) as mutual_connections
      FROM users u
      LEFT JOIN connections c1 ON (
        (c1.requester_id = u.id OR c1.receiver_id = u.id)
        AND c1.status = 'accepted'
        AND (
          c1.requester_id IN (
            SELECT CASE 
              WHEN requester_id = $1 THEN receiver_id 
              ELSE requester_id 
            END
            FROM connections 
            WHERE (requester_id = $1 OR receiver_id = $1) 
            AND status = 'accepted'
          )
          OR c1.receiver_id IN (
            SELECT CASE 
              WHEN requester_id = $1 THEN receiver_id 
              ELSE requester_id 
            END
            FROM connections 
            WHERE (requester_id = $1 OR receiver_id = $1) 
            AND status = 'accepted'
          )
        )
      )
      WHERE u.id != $1
      AND u.id NOT IN (
        SELECT CASE 
          WHEN requester_id = $1 THEN receiver_id 
          ELSE requester_id 
        END
        FROM connections 
        WHERE (requester_id = $1 OR receiver_id = $1)
        AND (status = 'accepted' OR status = 'pending')
      )
      GROUP BY u.id, u.name, u.title, u.avatar_url
      ORDER BY mutual_connections DESC, RANDOM()
      LIMIT 10`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const requesterId = req.session.userId;
    const { userId } = req.body;

    console.log("sendConnectionRequest - requesterId:", requesterId);
    console.log("sendConnectionRequest - userId (receiver):", userId);

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Convert to integer to ensure proper comparison
    const receiverId = parseInt(userId);

    if (requesterId === receiverId) {
      return res.status(400).json({ error: "Cannot connect to yourself" });
    }

    // Check if connection already exists
    const existingConnection = await pool.query(
      `SELECT * FROM connections 
       WHERE (requester_id = $1 AND receiver_id = $2) 
       OR (requester_id = $2 AND receiver_id = $1)`,
      [requesterId, receiverId]
    );

    if (existingConnection.rows.length > 0) {
      return res.status(400).json({ error: "Connection already exists" });
    }

    // Create new connection request
    const result = await pool.query(
      `INSERT INTO connections (requester_id, receiver_id, status, created_at)
       VALUES ($1, $2, 'pending', NOW())
       RETURNING *`,
      [requesterId, receiverId]
    );

    console.log("Connection created:", result.rows[0]);

    // Create notification for the receiver
    console.log(
      "Creating notification for recipientId:",
      receiverId,
      "actorId:",
      requesterId
    );

    try {
      await createNotification({
        recipientId: receiverId, // Person receiving the connection request
        actorId: requesterId, // Person sending the request
        type: "connection_request",
        postId: null,
        commentId: null,
        shareId: null,
        data: {},
      });
      console.log("Notification created successfully");
    } catch (notifErr) {
      console.error("createNotification() failed:", notifErr);
      // Don't fail the request if notification fails
    }

    res.json({ success: true, connection: result.rows[0] });
  } catch (err) {
    console.error("Error sending connection request:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Accept connection request
exports.acceptConnection = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { connectionId } = req.body;

    console.log(
      "acceptConnection - userId:",
      userId,
      "connectionId:",
      connectionId
    );

    if (!connectionId) {
      return res.status(400).json({ error: "Connection ID required" });
    }

    // Update connection status
    const result = await pool.query(
      `UPDATE connections 
       SET status = 'accepted', accepted_at = NOW()
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING *`,
      [connectionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    console.log("Connection accepted:", result.rows[0]);

    // Create notification for the requester
    console.log(
      "Creating notification for recipientId:",
      result.rows[0].requester_id,
      "actorId:",
      userId
    );

    try {
      await createNotification({
        recipientId: result.rows[0].requester_id, // Original requester gets notified
        actorId: userId, // Person who accepted
        type: "connection_accepted",
        postId: null,
        commentId: null,
        shareId: null,
        data: {},
      });
      console.log("Notification created successfully");
    } catch (notifErr) {
      console.error("createNotification() failed:", notifErr);
      // Don't fail the request if notification fails
    }

    res.json({ success: true, connection: result.rows[0] });
  } catch (err) {
    console.error("Error accepting connection:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Reject/Remove connection request
exports.rejectConnection = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({ error: "Connection ID required" });
    }

    // Delete connection
    const result = await pool.query(
      `DELETE FROM connections 
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING *`,
      [connectionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error rejecting connection:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user's connections count and details
// exports.getConnections = async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     const result = await pool.query(
//       `SELECT
//         u.id,
//         u.name,
//         u.title,
//         u.avatar_url,
//         c.created_at as connected_at
//       FROM connections c
//       JOIN users u ON (
//         CASE
//           WHEN c.requester_id = $1 THEN u.id = c.receiver_id
//           ELSE u.id = c.requester_id
//         END
//       )
//       WHERE (c.requester_id = $1 OR c.receiver_id = $1)
//       AND c.status = 'accepted'
//       ORDER BY c.created_at DESC`,
//       [userId]
//     );

//     res.json({
//       count: result.rows.length,
//       connections: result.rows,
//     });
//   } catch (err) {
//     console.error("Error fetching connections:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// Get user's connections count and details with block status
exports.getConnections = async (req, res) => {
  try {
    const userId = req.session.userId;

    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.title,
        u.avatar_url,
        c.created_at as connected_at,
        EXISTS(
          SELECT 1 FROM blocked_users
          WHERE user_id = $1 AND blocked_user_id = u.id
        ) as is_blocked
      FROM connections c
      JOIN users u ON (
        CASE
          WHEN c.requester_id = $1 THEN u.id = c.receiver_id
          ELSE u.id = c.requester_id
        END
      )
      WHERE (c.requester_id = $1 OR c.receiver_id = $1)
      AND c.status = 'accepted'
      ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json({
      count: result.rows.length,
      connections: result.rows,
    });
  } catch (err) {
    console.error("Error fetching connections:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get connections count only (for sidebar display)
exports.getConnectionsCount = async (req, res) => {
  try {
    const userId = req.session.userId;

    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM connections
       WHERE (requester_id = $1 OR receiver_id = $1)
       AND status = 'accepted'`,
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Error fetching connections count:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Accept connection by requester ID (for notifications)
exports.acceptConnectionByRequester = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { requesterId } = req.body;

    if (!requesterId) {
      return res.status(400).json({ error: "Requester ID required" });
    }

    // Find and update the connection
    const result = await pool.query(
      `UPDATE connections 
       SET status = 'accepted', accepted_at = NOW()
       WHERE requester_id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING *`,
      [requesterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    console.log("Connection accepted:", result.rows[0]);

    // Create notification for the requester
    try {
      await createNotification({
        recipientId: requesterId,
        actorId: userId,
        type: "connection_accepted",
        postId: null,
        commentId: null,
        shareId: null,
        data: {},
      });
    } catch (notifErr) {
      console.error("createNotification() failed:", notifErr);
    }

    res.json({ success: true, connection: result.rows[0] });
  } catch (err) {
    console.error("Error accepting connection:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Reject connection by requester ID (for notifications)
exports.rejectConnectionByRequester = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { requesterId } = req.body;

    if (!requesterId) {
      return res.status(400).json({ error: "Requester ID required" });
    }

    // Delete the connection request
    const result = await pool.query(
      `DELETE FROM connections 
       WHERE requester_id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING *`,
      [requesterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error rejecting connection:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get sent invitations (connection requests sent by current user)
exports.getSentInvitations = async (req, res) => {
  try {
    const userId = req.session.userId;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.receiver_id,
        c.created_at,
        u.name,
        u.title,
        u.avatar_url
      FROM connections c
      JOIN users u ON u.id = c.receiver_id
      WHERE c.requester_id = $1 AND c.status = 'pending'
      ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sent invitations:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Withdraw sent invitation
exports.withdrawInvitation = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID required" });
    }

    // Delete the connection request
    const result = await pool.query(
      `DELETE FROM connections 
       WHERE requester_id = $1 AND receiver_id = $2 AND status = 'pending'
       RETURNING *`,
      [userId, receiverId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error withdrawing invitation:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get catch-up updates (connection activities)
exports.getCatchUpUpdates = async (req, res) => {
  try {
    const userId = req.session.userId;
    const filter = req.query.filter || "all";

    // For now, return mock data as this would require additional tables
    // In production, you'd query from user_updates or activity_feed table

    // Get recent connections for activity feed
    const connections = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.title,
        u.avatar_url,
        c.created_at,
        c.accepted_at
      FROM connections c
      JOIN users u ON (
        CASE 
          WHEN c.requester_id = $1 THEN u.id = c.receiver_id
          ELSE u.id = c.requester_id
        END
      )
      WHERE (c.requester_id = $1 OR c.receiver_id = $1)
      AND c.status = 'accepted'
      ORDER BY c.accepted_at DESC
      LIMIT 20`,
      [userId]
    );

    // Transform to update format
    const updates = connections.rows.map((conn) => ({
      id: conn.id,
      name: conn.name,
      avatar_url: conn.avatar_url,
      type: "connection",
      created_at: conn.accepted_at || conn.created_at,
    }));

    res.json(updates);
  } catch (err) {
    console.error("Error fetching catch-up updates:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove connection
exports.removeConnection = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({ error: "Connection ID required" });
    }

    // Delete the connection
    const result = await pool.query(
      `DELETE FROM connections 
       WHERE ((requester_id = $1 AND receiver_id = $2) 
       OR (requester_id = $2 AND receiver_id = $1))
       AND status = 'accepted'
       RETURNING *`,
      [userId, connectionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Connection not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error removing connection:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Block user
exports.blockUser = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Check if block table exists, if not create it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, blocked_user_id)
      )
    `);

    // Add to blocked users
    await pool.query(
      `INSERT INTO blocked_users (user_id, blocked_user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, blocked_user_id) DO NOTHING`,
      [userId, targetUserId]
    );

    // Optionally remove connection
    await pool.query(
      `DELETE FROM connections 
       WHERE ((requester_id = $1 AND receiver_id = $2) 
       OR (requester_id = $2 AND receiver_id = $1))`,
      [userId, targetUserId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error blocking user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Remove from blocked users
    const result = await pool.query(
      `DELETE FROM blocked_users 
       WHERE user_id = $1 AND blocked_user_id = $2
       RETURNING *`,
      [userId, targetUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User is not blocked" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error unblocking user:", err);
    res.status(500).json({ error: "Server error" });
  }
};
