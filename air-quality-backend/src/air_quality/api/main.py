from dotenv import load_dotenv
from fastapi import FastAPI
from logging import config
from air_quality.api import forecast_controller, measurements_controller

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
config.fileConfig("./logging.ini", disable_existing_loggers=False)

app = FastAPI()
app.include_router(forecast_controller.router)
app.include_router(measurements_controller.router)
