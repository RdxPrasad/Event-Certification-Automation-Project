from fastapi import FastAPI
from app.database import engine , Base
from app.models import User , Event , Registration , Certificate
from app.routers import user

app = FastAPI() 

Base.metadata.create_all(bind=engine)

app.include_router(user.router)

@app.get("/")
def root():
    return {"message" : "Event & Certification Automation Backend Running 🎉"}