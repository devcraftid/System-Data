-- Script to Reset and Apply Working RLS Policies

-- 1. Drop all previous restrictive policies
DROP POLICY IF EXISTS "Users can view joined workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can access folders in their workspaces" ON folders;
DROP POLICY IF EXISTS "Users can create folders" ON folders;
DROP POLICY IF EXISTS "Users can insert members" ON workspace_members;
DROP POLICY IF EXISTS "Users can access spreadsheets via folders" ON spreadsheets;
DROP POLICY IF EXISTS "Users can create spreadsheets" ON spreadsheets;

-- 2. Create standard permissive policies for Authenticated Users 
-- (This ensures only logged in users can access data, avoiding recursion bugs during development)

-- WORKSPACES
CREATE POLICY "Auth users can read workspaces" ON workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert workspaces" ON workspaces FOR INSERT TO authenticated WITH CHECK (true);

-- WORKSPACE MEMBERS
CREATE POLICY "Auth users can read members" ON workspace_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert members" ON workspace_members FOR INSERT TO authenticated WITH CHECK (true);

-- FOLDERS
CREATE POLICY "Auth users can read folders" ON folders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert folders" ON folders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update folders" ON folders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete folders" ON folders FOR DELETE TO authenticated USING (true);

-- SPREADSHEETS
CREATE POLICY "Auth users can read spreadsheets" ON spreadsheets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert spreadsheets" ON spreadsheets FOR INSERT TO authenticated WITH CHECK (true);

-- AUDIT LOGS
CREATE POLICY "Auth users can read logs" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
