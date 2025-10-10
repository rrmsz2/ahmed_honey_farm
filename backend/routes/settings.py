from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from middleware.auth_middleware import get_current_admin
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class WhatsAppSettings(BaseModel):
    api_key: str
    admin_phone: str

@router.get("/whatsapp")
async def get_whatsapp_settings(
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Get WhatsApp settings"""
    try:
        db = request.state.db
        settings = await db.settings.find_one({'type': 'whatsapp'}, {"_id": 0})
        
        if not settings:
            # Return default settings
            return {
                "api_key": "akcfvdN9YTRL",
                "admin_phone": "+96895555386"
            }
        
        return {
            "api_key": settings.get('api_key', ''),
            "admin_phone": settings.get('admin_phone', '')
        }
    except Exception as e:
        logger.error(f"Error fetching WhatsApp settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching settings")

@router.put("/whatsapp")
async def update_whatsapp_settings(
    settings: WhatsAppSettings,
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Update WhatsApp settings"""
    try:
        db = request.state.db
        
        settings_data = {
            'type': 'whatsapp',
            'api_key': settings.api_key,
            'admin_phone': settings.admin_phone,
            'updated_at': datetime.utcnow()
        }
        
        await db.settings.update_one(
            {'type': 'whatsapp'},
            {'$set': settings_data},
            upsert=True
        )
        
        return {"success": True, "message": "Settings updated successfully"}
    except Exception as e:
        logger.error(f"Error updating WhatsApp settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating settings")
