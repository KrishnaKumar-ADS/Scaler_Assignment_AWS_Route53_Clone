from fastapi import FastAPI
import uvicorn
# Triggering hot reload to load new export routes
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, hosted_zones, dns_records, analytics, chat

app = FastAPI(title="Route53 Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://scaler-assignment-aws-route53-clone.vercel.app",
        "http://scaler-assignment-aws-route53-clone.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(dns_records.router)
app.include_router(analytics.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
