from fastapi import FastAPI
from app.api.endpoints import users, tasks
from app.db import base
from app.db.session import engine

# Base.metadata.create_all(bind=engine)  # 初期化時に1回だけ

app = FastAPI()
app.include_router(users.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")

