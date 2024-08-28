from fastapi import FastAPI, UploadFile, File
from ML.model.wav2vec2 import SpeechToTextModel
import os


app = FastAPI()

model = SpeechToTextModel()

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # Transcribe the audio
    transcription = model.transcribe(file_location)
    
    # Remove the temp file
    os.remove(file_location)
    
    return {"transcription": transcription}