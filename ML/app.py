from fastapi import FastAPI, UploadFile, File
from ML.model.wav2vec2 import SpeechToTextModel
import os


app = FastAPI()

model = SpeechToTextModel()

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    transcription = model.transcribe(file_location)
    
    os.remove(file_location)
    
    return {"transcription": transcription}