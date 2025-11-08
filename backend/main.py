import os
from fastapi import FastAPI
from dotenv import load_dotenv

from routes import users
from routes import webhooks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users")
app.include_router(webhooks.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}