from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from logging import config
from air_quality.api import forecast_controller, measurements_controller

origins = [
    "http://localhost:5173",
]

load_dotenv()
config.fileConfig("./logging.ini", disable_existing_loggers=False)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(forecast_controller.router)
app.include_router(measurements_controller.router)
