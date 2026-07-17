import { supabase } from './supabase'

export async function logAction(userId: string | undefined, action: 'CREATE' | 'EDIT' | 'DELETE' | 'EXPORT', targetTable: string, targetId: string) {
  if (!userId) return;
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      target_table: targetTable,
      target_id: targetId,
      workspace_id: null // optional if schema supports it
    })
  } catch (e) {
    console.error("Failed to log action:", e)
  }
}
