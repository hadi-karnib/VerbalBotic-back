import axios from "axios";

const CHATGPT_API = process.env.CHATGPT_API;
const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-3.5-turbo";

const getParentAdvice = async (prompt) => {
  const apiKey = CHATGPT_API;
  const model = CHAT_MODEL;

  const url = "https://api.openai.com/v1/chat/completions";
  try {
  } catch (error) {}
};

export default getAdvice;
