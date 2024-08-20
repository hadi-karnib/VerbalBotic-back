import User from "../Models/User.js";

export const createVoiceNote = async (req, res) => {
  const { message, voiceNoteMetadata } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newMessage = {
      message,
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
};
