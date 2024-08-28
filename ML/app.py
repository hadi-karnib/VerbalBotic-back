from fastapi import FastAPI, UploadFile, File
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
import torchaudio

app = FastAPI()

# Load the pre-trained wav2vec model and processor
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Load audio file
    waveform, sample_rate = torchaudio.load(file.file)

    # Resample the audio to 16kHz if necessary
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(sample_rate, 16000)
        waveform = resampler(waveform)

    # Preprocess the audio
    input_values = processor(waveform.squeeze().numpy(), return_tensors="pt", sampling_rate=16000).input_values

    # Get logits from the model
    with torch.no_grad():
        logits = model(input_values).logits

    # Take argmax and decode
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.decode(predicted_ids[0])

    return {"transcription": transcription}
