from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from routes import public, admin, settings
from utils.auth import get_password_hash
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Ahmad Honey Farm API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Ahmad Honey Farm API", "status": "running"}

# Dependency to inject db into route handlers
async def get_db_dependency():
    return db

# Middleware to inject database into request state
@app.middleware("http")
async def db_middleware(request: Request, call_next):
    request.state.db = db
    response = await call_next(request)
    return response

# Include routers
# Public routes
api_router.include_router(
    public.router,
    tags=["Public"]
)

# Admin routes
api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"]
)

# Settings routes
api_router.include_router(
    settings.router,
    prefix="/admin/settings",
    tags=["Settings"]
)

# Include the main API router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup event to initialize database
@app.on_event("startup")
async def startup_db():
    """Initialize database with default data"""
    try:
        # Check if admin user exists
        admin_exists = await db.admin_users.find_one({'username': 'admin'})
        if not admin_exists:
            # Create default admin user
            default_admin = {
                'username': 'admin',
                'password_hash': get_password_hash('admin123'),  # Change this password!
                'created_at': datetime.utcnow()
            }
            await db.admin_users.insert_one(default_admin)
            logger.info("Default admin user created: admin/admin123")
        
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()