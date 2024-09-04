import User from "../Models/User.js";
import { upload } from "../Middleware/multerConfig.js";
import getAdvice from "../CHAT_GPT/advice.js";
import { transcribeAudio } from "../GoogleModel/transcribe_Google.js";
import getParentAdvice from "../CHAT_GPT/ParentAdvice.js";
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
  const { diagnosis } = req.body;

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

    // console.log(
    //   user.chat.messages
    //     .map((msg) => msg.AI_response)
    //     .filter(Boolean)
    //     .join(" ")
    // );
    let prompt = "";
    if (diagnosis === "Good Speech") {
      prompt = `
        My name is ${user.name}, I work as a ${user.work}. My bio is: "${
        user.bio
      }". 
        My speech illness was diagnosed as "${diagnosis}". 
        Here are my previous instructions:
        ${user.chat.messages
          .map((msg) => msg.AI_response)
          .filter(Boolean)
          .join(" ")}
        I have been told my speech is good, but I want to improve even more. 
        What additional steps can I take to continue improving my speech?
        Provide three concise and actionable pieces of advice that I can work on daily. 
        Also, include a small homework schedule to follow. 
        Be creative and specific to my work if possible.
        Dont't tell me to seek a specialist.
        Start the message with "You seem to have Good Speech"
      `;
    } else if (diagnosis === "Stuttering") {
      prompt = `
        My name is ${user.name}, I work as a ${user.work}. My bio is: "${
        user.bio
      }". 
        My speech illness is "${user.illness || "Stuttering"}". 
        Here are my previous instructions:
        ${user.chat.messages
          .map((msg) => msg.AI_response)
          .filter(Boolean)
          .join(" ")}
        I have a stuttering problem. How can I fix it? 
        Please provide three concise, actionable points. 
        Also, give me a daily homework schedule to follow.
        Be direct, and make sure the advice is applicable to my daily work.
        Start the message with "You seem to have Stuttering Speech"

      `;
    }

    const AI_response = await getAdvice(prompt);
    message.AI_response = AI_response;

    await user.save();

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

const COMMON_WORDS = [
  "and",
  "the",
  "is",
  "in",
  "at",
  "of",
  "on",
  "for",
  "to",
  "a",
  "an",
];
const FILLER_WORDS = ["um", "uh", "er", "ah", "like"];

export const transcribeAudioGoogle = async (req, res) => {
  const { language, messageId } = req.body;

  try {
    const user = await User.findById(req.user._id).select("chat.messages");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const message = user.chat.messages.id(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const audioPath = message.message;

    const transcriptionResult = await transcribeAudio({
      language,
      voiceNote: audioPath,
    });

    const stutteringAnalysis = analyzeStuttering(
      transcriptionResult.transcription
    );

    message.diagnosis = stutteringAnalysis;

    await user.save();

    res.status(200).json({
      transcription: transcriptionResult,
      analysis: stutteringAnalysis,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Transcription failed", error: error.message });
  }
};

function analyzeStuttering(transcription) {
  const words = transcription.split(" ").filter((word) => word.trim() !== "");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (COMMON_WORDS.includes(word)) {
      if (i < words.length - 1 && word === words[i + 1]) {
        return "Stuttering";
      }
      continue;
    }

    const nextWords = words
      .slice(i + 1, i + 5)
      .filter((w) => !COMMON_WORDS.includes(w));
    if (nextWords.includes(word)) {
      return "Stuttering";
    }

    if (FILLER_WORDS.includes(words[i + 1])) {
      return "Stuttering";
    }
  }

  return "Good Speech";
}

export const fetchChildChats = async (req, res) => {
  const { childId } = req.body;

  try {
    const parent = await User.findById(req.user._id).select("children");

    if (!parent) {
      return res.status(404).json({ message: "Parent user not found" });
    }

    const isChild = parent.children.some(
      (id) => id.toString() === childId.toString()
    );

    if (!isChild) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this child's chats" });
    }

    const child = await User.findById(childId).select("+chat.messages");

    if (!child) {
      return res.status(404).json({ message: "Child user not found" });
    }

    if (!child.chat || !child.chat.messages.length) {
      return res
        .status(404)
        .json({ message: "No messages found for this child" });
    }

    res.status(200).json(child.chat.messages);
  } catch (err) {
    console.error("Error retrieving child's chats:", err);
    res.status(500).json({
      message: "Failed to retrieve child's messages",
      error: err.message,
    });
  }
};

export const parentAdvice = async (req, res) => {
  const { prompt } = req.body; // Prompt comes from the parent's input

  try {
    // Find the parent user
    const parent = await User.findById(req.user._id).select(
      "chat.messages name bio work"
    );

    if (!parent) {
      return res.status(404).json({ message: "Parent user not found" });
    }

    // If the parent has no chat or messages, return a message
    if (!parent.chat || !parent.chat.messages.length) {
      return res
        .status(404)
        .json({ message: "No previous chat messages found for the parent" });
    }

    // Extract previous AI responses from the parent's chat
    const previousAIResponses = parent.chat.messages
      .map((msg) => msg.AI_response)
      .filter(Boolean) // Only include existing responses
      .join(" ");

    // Filter out repetitive words by splitting, removing duplicates, and joining again
    const filteredPreviousResponses = previousAIResponses
      .split(" ")
      .filter((word, index, self) => self.indexOf(word) === index)
      .join(" ");

    // Create the prompt for ChatGPT
    const parentPrompt = `
      I'm a parent seeking advice on how to help my child with speech improvement.
      My background: I work as ${parent.work}, and my bio is: "${parent.bio}".
      Here are previous suggestions from AI: ${filteredPreviousResponses}.
      The following is what I need further advice on: "${prompt}".
    `;

    // Send the constructed prompt to the ChatGPT API
    const advice = await getParentAdvice(parentPrompt);

    // Send back the advice to the parent
    res.status(200).json({ advice });
  } catch (error) {
    console.error("Error fetching parent advice:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve advice", error: error.message });
  }
};
