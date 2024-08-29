import { readFileSync } from "fs";
import axios from "axios";

const apiKey = process.env.GOOGLE_API;

export async function transcribeAudio({ language, voiceNote }) {
  // Read the audio file
  const file = readFileSync(voiceNote);
  const audioBytes = file.toString("base64");

  // Configure the request
  const request = {
    config: {
      encoding: "MP3",
      sampleRateHertz: 16000,
      languageCode: language,
      alternativeLanguageCodes: ["en-US", "fr-FR"], // English and French as alternatives
    },
    audio: {
      content: audioBytes,
    },
  };

  try {
    // Send the request to the Google Speech-to-Text API
    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      request
    );

    console.log("Raw Response:", response.data);

    const transcription = response.data.results
      .map((result) => result.alternatives[0]?.transcript)
      .join("\n");

    console.log(`Transcription: ${transcription || "No transcription found"}`);

    return {
      transcription: transcription || "No transcription found",
      rawResponse: response.data,
    };
  } catch (error) {
    console.error(
      "Error during transcription:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}
