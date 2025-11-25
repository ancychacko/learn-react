// utils/safeUnlink.js
const fs = require("fs");
const path = require("path");

module.exports = function safeUnlink(relPath) {
  if (!relPath) return;

  const abs = path.join(process.cwd(), relPath.replace(/^\//, ""));

  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (err) {
    console.warn("Failed to unlink:", abs, err.message);
  }
};
