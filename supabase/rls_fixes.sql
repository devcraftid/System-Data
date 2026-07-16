-- Enable INSERT policies for the tables since we only had SELECT/ALL USING policies previously

-- Allow users to create workspaces
CREATE POLICY "Users can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to add themselves as members to workspaces they created
CREATE POLICY "Users can insert members" ON workspace_members
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to create folders
CREATE POLICY "Users can create folders" ON folders
    FOR INSERT WITH CHECK (
        workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    );

-- Allow users to create spreadsheets
CREATE POLICY "Users can create spreadsheets" ON spreadsheets
    FOR INSERT WITH CHECK (
        folder_id IN (
            SELECT id FROM folders WHERE workspace_id IN (
                SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
            )
        )
    );
