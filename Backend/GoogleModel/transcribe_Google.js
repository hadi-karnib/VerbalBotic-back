import { readFileSync } from "fs";
import axios from "axios";

async function transcribeAudio(filePath) {
  const apiKey = process.env.GOOGLE_API;

  // Read the file content
  const file = readFileSync(filePath);
  const audioBytes = file.toString("base64");

  const request = {
    config: {
      encoding: "MP3",
      sampleRateHertz: 16000,
      languageCode: "en-US",
    },
    audio: {
      content: audioBytes,
    },
  };

  try {
    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      request
    );

    console.log("Raw Response:", response.data);

    const transcription = response.data.results
      .map((result) => result.alternatives[0]?.transcript)
      .join("\n");

    console.log(`Transcription: ${transcription || "No transcription found"}`);
    return transcription;
  } catch (error) {
    console.error(
      "Error during transcription:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// Example usage
const audioFilePath =
  "C:/Users/HadiK/Desktop/SEFInalVerbalbotic/VerbalBotic-back/Backend/uploads/voiceNote-1724925343255.m4a";
transcribeAudio(audioFilePath)
  .then((transcription) =>
    console.log("Transcription completed successfully:", transcription)
  )
  .catch((err) => console.error("Failed to transcribe audio:", err));
