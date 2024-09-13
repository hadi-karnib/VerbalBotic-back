import axios from "axios";

const CHATGPT_API = process.env.CHATGPT_API;
const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-3.5-turbo";

const getParentAdvice = async (prompt) => {
  const apiKey = CHATGPT_API;
  const model = CHAT_MODEL;

  const url = "https://api.openai.com/v1/chat/completions";
  try {
    const response = await axios.post(
      url,
      {
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const advice = response.data.choices[0].message.content.trim();
    return advice;
  } catch (error) {
    console.error("Error fetching advice:", error);
    return "Sorry, I couldn't fetch advice at the moment.";
  }
};

export default getParentAdvice;
