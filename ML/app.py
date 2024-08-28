from fastapi import FastAPI, UploadFile, File
from ML.model.wav2vec2 import SpeechToTextModel
import os