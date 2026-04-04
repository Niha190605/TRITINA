const Message = require("../models/Message");
const User    = require("../models/User");

// POST /api/messages  (doctor sends to patient)
exports.sendMessage = async (req, res, next) => {
  try {
    const { toUserId, text, relatedReport } = req.body;
    if (!toUserId || !text?.trim())
      return res.status(400).json({ success: false, message: "toUserId and text required." });

    const recipient = await User.findById(toUserId);
    if (!recipient) return res.status(404).json({ success: false, message: "Recipient not found." });

    const msg = await Message.create({ from: req.user._id, to: toUserId, text, relatedReport: relatedReport || null });

    res.status(201).json({
      success: true,
      message: {
        id:   msg._id.toString(),
        from: req.user.name,
        text: msg.text,
        time: msg.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        read: msg.read,
        createdAt: msg.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/messages/conversation/:userId
exports.getConversation = async (req, res, next) => {
  try {
    const me = req.user._id, partner = req.params.userId;

    const msgs = await Message.find({
      $or: [{ from: me, to: partner }, { from: partner, to: me }],
    }).sort({ createdAt: 1 });

    // Mark incoming as read
    await Message.updateMany({ from: partner, to: me, read: false }, { read: true });

    res.status(200).json({
      success: true,
      messages: msgs.map(m => ({
        id:       m._id.toString(),
        from:     m.from?.name || "Unknown",
        fromRole: m.from?.role,
        fromId:   m.from?._id?.toString(),
        text:     m.text,
        time:     m.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        read:     m.read,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) { next(err); }
};

// GET /api/messages/inbox
exports.getInbox = async (req, res, next) => {
  try {
    const me  = req.user._id;
    const all = await Message.find({ $or: [{ from: me }, { to: me }] }).sort({ createdAt: -1 });

    const seen = new Set(), threads = [];
    for (const msg of all) {
      const partnerId = msg.from._id.toString() === me.toString() ? msg.to._id.toString() : msg.from._id.toString();
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        const unread = await Message.countDocuments({ from: partnerId, to: me, read: false });
        threads.push({ latestMessage: msg, unreadCount: unread });
      }
    }
    res.status(200).json({ success: true, threads });
  } catch (err) { next(err); }
};

// GET /api/messages/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ to: req.user._id, read: false });
    res.status(200).json({ success: true, unreadCount: count });
  } catch (err) { next(err); }
};