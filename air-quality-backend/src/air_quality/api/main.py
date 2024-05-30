from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    """
    Placeholder endpoint
    """
    return {"message": "Hello World"}
