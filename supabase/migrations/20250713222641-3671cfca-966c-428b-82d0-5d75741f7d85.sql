-- Grant all privileges to service_role on all existing tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant privileges on future tables in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO service_role;

-- Grant usage on all sequences (for auto-incrementing columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant usage on all functions in public schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;