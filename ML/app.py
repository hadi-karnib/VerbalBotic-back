from fastapi import FastAPI, UploadFile, File
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
import torchaudio

app = FastAPI()


processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):

    waveform, sample_rate = torchaudio.load(file.file)


    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(sample_rate, 16000)
        waveform = resampler(waveform)


    input_values = processor(waveform.squeeze().numpy(), return_tensors="pt", sampling_rate=16000).input_values


    with torch.no_grad():
        logits = model(input_values).logits


    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.decode(predicted_ids[0])

    return {"transcription": transcription}
