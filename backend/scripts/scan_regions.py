import sys
from sqlalchemy import create_engine, text

# Project details from .env
PROJECT_REF = "hmwaoxbluljfqmsytyjv"
PASSWORD = "M1k1sB3ll.$"
DB_NAME = "postgres"

# Common Supabase Pooler Regions
REGIONS = [
    "us-east-1",      # N. Virginia (Most common)
    "sa-east-1",      # São Paulo (Likely for Spanish/Latam users)
    "eu-central-1",   # Frankfurt
    "ap-southeast-1", # Singapore
    "eu-west-1",      # Ireland
    "us-west-1",      # N. California
    "ap-northeast-1", # Tokyo
    "ca-central-1",   # Canada
    "ap-southeast-2", # Sydney
    "eu-west-2",      # London
    "eu-west-3",      # Paris
]

def check_connection(region):
    pooler_host = f"aws-0-{region}.pooler.supabase.com"
    # Pooler username format: [user].[project_ref]
    user = f"postgres.{PROJECT_REF}"
    
    # Construct connection string
    # Using psycopg2 driver
    db_url = f"postgresql://{user}:{PASSWORD}@{pooler_host}:5432/{DB_NAME}"
    
    print(f"Testing region: {region} ({pooler_host})...")
    
    try:
        engine = create_engine(db_url, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print(f"✅ SUCCESS! Connected to {region}")
            return db_url
    except Exception as e:
        # If tenant not found, it implies accessible host but wrong region (or auth fail)
        # OperationalError usually means network timeout or bad host if region does not exist
        # print(f"   Failed: {e}")
        return None

def main():
    print(f"Scanning regions for project {PROJECT_REF}...")
    
    # Heuristic: Try South America first given user language/name, then US
    priority_regions = ["sa-east-1", "us-east-1", "eu-central-1"]
    remaining_regions = [r for r in REGIONS if r not in priority_regions]
    
    for region in priority_regions + remaining_regions:
        valid_url = check_connection(region)
        if valid_url:
            print("\n" + "="*50)
            print(f"FOUND VALID CONNECTION!")
            print(f"Region: {region}")
            print(f"Connection String: {valid_url}")
            print("="*50)
            
            # Save to a temporary file for the agent to read
            with open("valid_db_url.txt", "w") as f:
                f.write(valid_url)
            return
            
    print("\nCould not connect to any known region. Please check credentials or project status.")

if __name__ == "__main__":
    main()
