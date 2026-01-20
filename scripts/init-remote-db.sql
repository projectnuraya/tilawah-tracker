-- Remote Database Initialization Script
-- Run this script on your remote PostgreSQL server to set up the database and user.

-- 1. Create the database
CREATE DATABASE "tilawah_tracker";

-- 2. Create the user (adjust password as needed)
-- REPLACE 'secure_password_here' WITH A STRONG PASSWORD
CREATE USER "tilawah_admin" WITH ENCRYPTED PASSWORD 'secure_password_here';

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "tilawah_tracker" TO "tilawah_admin";

-- 4. Connect to the database to set schema permissions (if needed for public schema)
-- \c tilawah_tracker
-- GRANT ALL ON SCHEMA public TO "tilawah_admin";
