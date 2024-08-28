from fastapi import FastAPI, UploadFile, File
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
import torchaudio
from pydub import AudioSegment
import io

app = FastAPI()

# Load the pre-trained wav2vec model and processor
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    # Read the uploaded file into a byte stream
    audio_bytes = io.BytesIO(await file.read())

    # Convert m4a or mp3 to WAV using pydub
    if file.filename.endswith(".m4a") or file.filename.endswith(".mp3"):
        audio = AudioSegment.from_file(audio_bytes, format=file.filename.split('.')[-1])
        audio = audio.set_frame_rate(16000)  # Resample to 16kHz
        audio_bytes = io.BytesIO()
        audio.export(audio_bytes, format="wav")

    # Load audio file using torchaudio
    waveform, sample_rate = torchaudio.load(audio_bytes)

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
