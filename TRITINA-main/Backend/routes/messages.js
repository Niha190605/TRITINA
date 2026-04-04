const express = require("express");
const router  = express.Router();

const { protect } = require("../middleware/auth");
const {
  sendMessage,
  getConversation,
  getInbox,
  getUnreadCount,
} = require("../controllers/messageController");

router.post("/",                    protect, sendMessage);
router.get("/inbox",                protect, getInbox);
router.get("/unread-count",         protect, getUnreadCount);
router.get("/conversation/:userId", protect, getConversation);

module.exports = router;