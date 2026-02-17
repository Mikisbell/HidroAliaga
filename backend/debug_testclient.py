from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()

try:
    with TestClient(app) as client:
        print("TestClient instantiation successful")
except Exception as e:
    print(f"TestClient failed: {e}")
    import traceback
    traceback.print_exc()
