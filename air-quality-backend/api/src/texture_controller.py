import logging as log
from datetime import datetime
from typing import List

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from src.mappers.texture_mapper import map_texture
from src.types import TextureDto
from shared.src.database.forecasts import get_data_textures_from_database

router = APIRouter()


@router.get("/air-pollutant/data_textures")
async def get_data_texture(
    base_time: datetime,
) -> List[TextureDto]:
    log.info(
        "Fetching forecast data texture URIs for base time {}".format(
            base_time
        )
    )
    db_results = get_data_textures_from_database(
        base_time,
    )
    log.info(f"Fetched {len(db_results)} results from the database")

    if not db_results:
        log.info("No data found, returning 404")
        return JSONResponse(status_code=404, content={})
    
    log.info(f"Responding with {len(db_results)} results")
    return map_texture(db_results)
