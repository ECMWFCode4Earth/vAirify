from dotenv import load_dotenv
from fastapi import FastAPI
from logging import config
from air_quality.api import forecast_controller, measurements_controller


load_dotenv()
app = FastAPI()
config.fileConfig("./logging.ini")

app.include_router(forecast_controller.router)
app.include_router(measurements_controller.router)
