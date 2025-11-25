// db/migrations.js
const pool = require("./pool");

/**
 * runMigrations()
 * Executes ALL SQL schema creation + migration patches safely.
 * Runs automatically when the server starts.
 */
async function runMigrations() {
  console.log("📦 Running migrations...");

  try {
    await pool.query(`
      ------------------------------------------------------------------
      -- USERS: Safe rename "about" → "title"
      ------------------------------------------------------------------
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='about'
        ) THEN
          -- Only rename if "title" does not already exist
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='users' AND column_name='title'
          ) THEN
            ALTER TABLE users RENAME COLUMN about TO title;
          END IF;
        END IF;
      END $$;

      ------------------------------------------------------------------
      -- FOLLOWS: follower → followee relationship
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (follower_id, followee_id)
      );

      ------------------------------------------------------------------
      -- POSTS: already exist in your schema (not recreated)
      ------------------------------------------------------------------

      ------------------------------------------------------------------
      -- LIKES TABLE
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (post_id, user_id)
      );

      ------------------------------------------------------------------
      -- COMMENTS TABLE
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      ------------------------------------------------------------------
      -- COMMENT LIKES
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (comment_id, user_id)
      );

      ------------------------------------------------------------------
      -- SHARES
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS shares (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      ------------------------------------------------------------------
      -- SHARE RECIPIENTS
      -- (For "Send", "Share with thoughts", LinkedIn-style)
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS shares_recipients (
        id SERIAL PRIMARY KEY,
        share_id INTEGER NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );

      ------------------------------------------------------------------
      -- REPORTS TABLE
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      ------------------------------------------------------------------
      -- NOTIFICATIONS TABLE
      -- (Likes, Comments, Shares, Mentions, Reshares)
      ------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        type TEXT NOT NULL,  -- like, comment, share, reshare, mention, message
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        share_id INTEGER REFERENCES shares(id) ON DELETE CASCADE,
        data JSONB DEFAULT '{}'::jsonb,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
    `);

    console.log("✅ Migrations completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
}

module.exports = runMigrations;
