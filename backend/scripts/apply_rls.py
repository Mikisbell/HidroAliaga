import sys
import os
from sqlalchemy import text
from pathlib import Path

# Add backend directory to sys.path to allow imports from app
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.db.database import sync_engine

def apply_rls():
    print("Connecting to database...")
    
    # Path to the SQL file
    # Assuming script is in backend/scripts/
    # SQL is in frontend/src/lib/supabase/migrations/rbac_schema.sql
    # We use absolute path or relative lookup
    
    root_dir = backend_dir.parent
    sql_path = root_dir / "frontend" / "src" / "lib" / "supabase" / "migrations" / "rbac_schema.sql"
    
    if not sql_path.exists():
        print(f"Error: SQL file not found at {sql_path}")
        return

    print(f"Reading SQL from {sql_path.name}...")
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Split commands by semicolon to execute them one by one (safer for some engines)
    # However, for plpgsql functions/triggers, splitting by ; is dangerous.
    # SQLAlchemy execute can often handle blocks if they are valid SQL.
    # rbac_schema.sql contains DO $$ ... $$ blocks or standard SQL.
    # Let's try executing the whole block first, or split intelligently.
    # The file has comments and multiple statements.
    # A safe bet is to let the DB driver handle the script if possible, or split.
    # Given the content, it has `create policy` etc.
    
    # Simple split might break triggers. 
    # Let's try to pass the whole string. PostgreSQL usually accepts multiple statements in one call.
    
    connection = sync_engine.connect()
    trans = connection.begin()
    
    try:
        print("Executing RLS policies...")
        # We wrap in text()
        connection.execute(text(sql_content))
        
        trans.commit()
        print("RLS Policies applied successfully!")
        print("Data isolation is now enforced.")
        
    except Exception as e:
        trans.rollback()
        print(f"Error applying RLS: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    apply_rls()
