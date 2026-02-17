import asyncio
import jwt
from datetime import datetime, timezone, timedelta
from app.config.settings import settings
from app.core.auth import verify_supabase_token
from uuid import uuid4

async def test_auth():
    print(f"Secret used in script: {settings.SUPABASE_JWT_SECRET}")
    
    user_id = uuid4()
    payload = {
        "sub": str(user_id),
        "email": "user_a@example.com",
        "role": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    print(f"Generated Token: {token}")

    try:
        user = await verify_supabase_token(token)
        print(f"Verification Success! User: {user}")
    except Exception as e:
        print(f"Verification Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_auth())
