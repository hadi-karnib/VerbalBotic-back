from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
import soundfile as sf

class SpeechToTextModel:
    def __init__(self):
        self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-large-960h")
        self.model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-large-960h")

    def transcribe(self, file_path):

        speech, rate = sf.read(file_path)
        input_values = self.processor(speech, sampling_rate=rate, return_tensors="pt").input_values


        logits = self.model(input_values).logits


        predicted_ids = torch.argmax(logits, dim=-1)


        transcription = self.processor.decode(predicted_ids[0])
        return transcription
