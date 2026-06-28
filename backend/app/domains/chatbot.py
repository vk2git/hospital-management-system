from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.ai.ollama_client import ask_ai

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

class ChatbotMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

class ChatbotMessageResponse(BaseModel):
    reply: str

HOSPITAL_CONTEXT = """
You are a helpful assistant for Rising Hospital (Mother and Child Care Centre).
You can ONLY answer questions about the hospital. Do NOT answer any unrelated questions.

Hospital Information:
- Name: Rising Hospital
- Location: 24, ABC Layout, Bengaluru, Karnataka, 560001
- Phone: 080-567890900
- Email: contact@risinghospital.com
- Hours: 24/7 Emergency, OPD 9 AM - 5 PM Monday to Saturday

Services:
- Pediatric Care: Holistic healthcare for children. Consultation from $20.
- Cardiology: Advanced cardiac screening & specialist procedures. Consultation from $45.
- Diagnostic Lab: High-precision testing & biochemistry reports. Reports delivered in 2 hours.
- Emergency Care: Critical care unit and trauma response available 24/7. Response time under 5 minutes.
- Maternity Wing: Full prenatal and postnatal care.
- Orthopedics: Sports medicine and joint care.

Key Features:
- Online appointment booking via patient portal
- Quick booking — next slot often within 10 minutes
- Digital medical records accessible through the portal
- Secure messaging with clinic desk
- Lab reports uploaded within 2-4 hours
- All major insurance carriers accepted
- Cashless billing for approved providers
"""

async def generate_chatbot_reply(user_message: str) -> str:
    """Send a user message to the local AI with the hospital context."""
    prompt = f"User: {user_message}\nAssistant:"
    try:
        reply = await ask_ai(prompt, system_prompt=HOSPITAL_CONTEXT)
        return reply
    except Exception as e:
        print(f"Ollama error: {e}")
        return "I'm sorry, I'm having trouble connecting to my knowledge base right now."

@router.post("/", response_model=ChatbotMessageResponse)
@router.post("/message", response_model=ChatbotMessageResponse)
async def chat_with_bot(req: ChatbotMessageRequest):
    """Chat with the hospital AI assistant."""
    reply = await generate_chatbot_reply(req.message)
    return ChatbotMessageResponse(reply=reply)
