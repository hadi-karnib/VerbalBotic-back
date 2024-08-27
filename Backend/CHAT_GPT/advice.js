import axios from "axios";

const CHATGPT_API = process.env.CHATGPT_API;
const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-3.5-turbo";

const getAdvice = async (user) => {
  const apiKey = CHATGPT_API;
  const model = CHAT_MODEL;

  // Construct the context for the ChatGPT prompt
  let previousAdvice = "";
  if (user.chat && user.chat.messages.length > 0) {
    previousAdvice = user.chat.messages
      .map((message) => message.AI_response)
      .join(" ");
  }

  const prompt = `
    I have a speech impairment, specifically stuttering. How can I fix it? Please connect the advice to my work (${user.work}) if applicable. 
    Here's what you've told me before: ${previousAdvice}.
    I don't want introductions, just actionable advice on what I can do generally. Additionally, provide a small daily homework schedule.
    Make the answers concise and unique, avoid repetition. Provide up to three points excluding the homework.
  `;

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

export default getAdvice;
