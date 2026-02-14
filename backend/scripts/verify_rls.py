import sys
from pathlib import Path
# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from sqlalchemy import text
from app.db.database import sync_engine

def verify():
    print("Verifying RLS policies...")
    try:
        with sync_engine.connect() as conn:
            # Check policies on 'proyectos'
            result = conn.execute(text("select policyname, tablename, cmd from pg_policies where tablename = 'proyectos'"))
            policies = result.fetchall()
            
            print(f"Found {len(policies)} policies on 'proyectos':")
            for p in policies:
                print(f"- {p[0]} ({p[2]})")
                
            # Check if RLS is enabled
            result_rls = conn.execute(text("select relname, relrowsecurity from pg_class where relname = 'proyectos'"))
            rls = result_rls.fetchone()
            if rls:
                print(f"RLS Enabled on projects: {rls[1]}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify()
