import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Conversation from "../models/conversationModel.js";

export const createConversation = async (req, res) => {
  const { participantIds } = req.body;
  try {
    if (!participantIds || participantIds.length < 2) {
      return res
        .status(400)
        .json({ message: "At least two participants are required" });
    }

    const existingConversation = await Conversation.findOne({
      participants: { $all: participantIds, $size: participantIds.length },
    });
    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }
    const conversation = await Conversation.create({
      participants: participantIds,
    });
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "_id username avatar")
      .sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
    });

    conversation.lastMessage = text;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const page = parseInt(req.query.page) || 1;
  try {
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
