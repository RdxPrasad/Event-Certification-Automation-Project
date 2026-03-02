from fastapi import FastAPI
from app.database import engine , Base

app = FastAPI() 

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message" : "Event & Certification Automation Backend Running 🎉"}