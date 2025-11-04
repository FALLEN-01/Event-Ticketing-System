from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://ckkyegjnbcrmipozjahe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNra3llZ2puYmNybWlwb3pqYWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDMzNTAsImV4cCI6MjA3NzgxOTM1MH0.7yNGRvhzA82h7STPSEy4TwgSxqQlkbrkBlWYOBYbgR8"

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase():
    """
    Get Supabase client
    """
    return supabase
