import User from "../Models/User.js";
import { upload } from "../Middleware/multerConfig.js";
import getAdvice from "../CHAT_GPT/advice.js";

export const createVoiceNote = [
  upload.single("voiceNote"),
  async (req, res) => {
    const { duration, format, size } = req.body;

    try {
      const user = await User.findById(req.user._id).select("chat.messages");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.chat) {
        user.chat = { messages: [] };
      } else if (!user.chat.messages) {
        user.chat.messages = [];
      }

      const voiceNoteMetadata = {
        duration,
        format,
        size,
      };

      const messagePath = req.file.path.replace(/\\/g, "/");

      const newMessage = {
        message: messagePath,
        voiceNoteMetadata,
      };

      user.chat.messages.push(newMessage);

      await user.save();

      res.status(201).json(user.chat.messages[user.chat.messages.length - 1]);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to create voice note", error: err.message });
    }
  },
];

export const updateAfterAnalysis = async (req, res) => {
  const { messageId } = req.params;
  const { diagnosis } = req.body;

  try {
    const user = await User.findById(req.user._id).select("chat.messages");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.chat || !user.chat.messages) {
      return res.status(404).json({ message: "No messages found" });
    }

    const message = user.chat.messages.find(
      (msg) => msg._id.toString() === messageId
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.diagnosis = diagnosis;

    await user.save();

    res.status(200).json(message);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update diagnosis", error: err.message });
  }
};

export const updateAfterChatGPT = async (req, res) => {
  const { messageId } = req.params;

  try {
    const user = await User.findById(req.user._id).select(
      "chat messages name age bio work illness"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.chat || !user.chat.messages) {
      return res.status(404).json({ message: "No messages found" });
    }

    const message = user.chat.messages.id(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Create a prompt based on the user's details and previous AI responses
    const prompt = `
      My name is ${user.name}, I work as a ${user.work}. My bio is: "${
      user.bio
    }". 
      My speech illness is "${user.illness || "None"}". 
      Here are my previous instructions:
      ${user.chat.messages
        .map((msg) => msg.AI_response)
        .filter(Boolean)
        .join(" ")}
      I have a speech impairment, stuttering. How can I fix it? 
      Maybe the advice can be connected to my work if applicable. 
      Give me advice. I don’t want introductions, just what to do generally and maybe give me homework on what to do daily. 
      Be creative. I just want what to do, no "here are tips" or something. 
      Make the answers concise and small, maybe 3 points excluding the homework if you want but make them unique. 
      Don't forget to give me a small schedule.
    `;

    // Get advice from ChatGPT
    const AI_response = await getAdvice(prompt);
    message.AI_response = AI_response;

    // Save the updated user document
    await user.save();

    // Return the updated message with the new AI response
    res.status(200).json(message);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update AI response", error: err.message });
  }
};
export const getMyChats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("chat.messages");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.chat || !user.chat.messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.status(200).json(user.chat.messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve messages", error: err.message });
  }
};
