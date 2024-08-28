from fastapi import FastAPI, UploadFile, File
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor, pipeline
import torch
from pydub import AudioSegment
import numpy as np
import io
from fuzzywuzzy import fuzz
from sentence_transformers import SentenceTransformer, util
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")
semantic_model = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L6-v2')

COMMON_WORDS = {"and", "the", "is", "in", "at", "of", "on", "for", "to", "a", "an"}
FILLER_WORDS = {"um", "uh", "er", "ah", "like"}

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    audio_bytes = io.BytesIO(await file.read())

    audio = AudioSegment.from_file(audio_bytes, format=file.filename.split('.')[-1])
    audio = audio.set_frame_rate(16000).set_channels(1)
    samples = np.array(audio.get_array_of_samples(), dtype=np.int16)
    samples = samples / np.iinfo(np.int16).max

    input_values = processor(samples, return_tensors="pt", sampling_rate=16000).input_values

    with torch.no_grad():
        logits = model(input_values).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.decode(predicted_ids[0])

    result = analyze_stuttering(transcription)
    
    return {"transcription": transcription, "analysis": result}

def analyze_stuttering(transcription: str) -> str:
    words = transcription.lower().split()

    for i, word in enumerate(words):

        if i < len(words) - 1:

            if word == words[i + 1]:
                return "Stuttering"


            if fuzz.ratio(word, words[i + 1]) > 85:
                return "Stuttering"


            if word not in COMMON_WORDS and word in words[i+1:i+5]:
                return "Stuttering"


            if words[i + 1] in FILLER_WORDS:
                return "Stuttering"


            similarity_score = util.pytorch_cos_sim(semantic_model.encode(word), semantic_model.encode(words[i + 1]))
            if similarity_score > 0.85:
                return "Stuttering"

    return "Good Speech"
