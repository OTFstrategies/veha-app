-- =============================================================================
-- Migration 008: Universal Thread System + Notifications
-- =============================================================================
-- Adds threaded conversations on projects, tasks, and clients
-- with metadata per message, file attachments, and in-app notifications.
-- =============================================================================

-- =============================================================================
-- Enum Types
-- =============================================================================

CREATE TYPE thread_entity_type AS ENUM ('project', 'task', 'client');
CREATE TYPE thread_status_tag AS ENUM ('vraag', 'besluit', 'update', 'probleem', 'idee');
CREATE TYPE thread_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE thread_category AS ENUM ('algemeen', 'technisch', 'planning', 'financieel', 'klant');
CREATE TYPE notification_type AS ENUM ('mention', 'reply', 'new_thread', 'assignment');

-- =============================================================================
-- Tables
-- =============================================================================

-- Threads: polymorphic via entity_type + entity_id
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type thread_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread messages (posts within a thread)
CREATE TABLE thread_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  status_tag thread_status_tag,
  priority thread_priority DEFAULT 'normal',
  category thread_category DEFAULT 'algemeen',
  mentions UUID[] DEFAULT '{}',
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File attachments on messages
CREATE TABLE thread_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES thread_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- In-app notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  message_id UUID REFERENCES thread_messages(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES profiles(id),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_threads_entity ON threads(entity_type, entity_id);
CREATE INDEX idx_threads_workspace ON threads(workspace_id);
CREATE INDEX idx_threads_created_by ON threads(created_by);
CREATE INDEX idx_thread_messages_thread ON thread_messages(thread_id, created_at);
CREATE INDEX idx_thread_messages_author ON thread_messages(author_id);
CREATE INDEX idx_thread_attachments_message ON thread_attachments(message_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_workspace ON notifications(workspace_id);
CREATE INDEX idx_notifications_thread ON notifications(thread_id);

-- =============================================================================
-- Triggers: updated_at
-- =============================================================================

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thread_messages_updated_at BEFORE UPDATE ON thread_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Threads: workspace-based access
CREATE POLICY threads_select ON threads
  FOR SELECT USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY threads_insert ON threads
  FOR INSERT WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY threads_update ON threads
  FOR UPDATE USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY threads_delete ON threads
  FOR DELETE USING (
    workspace_id IN (SELECT get_user_workspace_ids())
    AND (created_by = auth.uid() OR get_user_role_in_workspace(workspace_id) = 'admin')
  );

-- Messages: access via thread workspace
CREATE POLICY messages_select ON thread_messages
  FOR SELECT USING (
    thread_id IN (SELECT id FROM threads WHERE workspace_id IN (SELECT get_user_workspace_ids()))
  );

CREATE POLICY messages_insert ON thread_messages
  FOR INSERT WITH CHECK (
    thread_id IN (SELECT id FROM threads WHERE workspace_id IN (SELECT get_user_workspace_ids()))
  );

CREATE POLICY messages_update ON thread_messages
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY messages_delete ON thread_messages
  FOR DELETE USING (author_id = auth.uid());

-- Attachments: access via message -> thread -> workspace
CREATE POLICY attachments_select ON thread_attachments
  FOR SELECT USING (
    message_id IN (
      SELECT tm.id FROM thread_messages tm
      JOIN threads t ON tm.thread_id = t.id
      WHERE t.workspace_id IN (SELECT get_user_workspace_ids())
    )
  );

CREATE POLICY attachments_insert ON thread_attachments
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY attachments_delete ON thread_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- Notifications: only own notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (recipient_id = auth.uid());

-- =============================================================================
-- Notification Triggers
-- =============================================================================

-- Auto-create notifications when a user is @mentioned
CREATE OR REPLACE FUNCTION notify_on_mention()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user UUID;
  thread_record RECORD;
  actor_name TEXT;
BEGIN
  IF array_length(NEW.mentions, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO thread_record FROM threads WHERE id = NEW.thread_id;
  SELECT full_name INTO actor_name FROM profiles WHERE id = NEW.author_id;

  FOREACH mentioned_user IN ARRAY NEW.mentions LOOP
    IF mentioned_user != NEW.author_id THEN
      INSERT INTO notifications (workspace_id, recipient_id, type, title, body, thread_id, message_id, actor_id)
      VALUES (
        thread_record.workspace_id,
        mentioned_user,
        'mention',
        actor_name || ' heeft je genoemd',
        LEFT(NEW.content, 100),
        NEW.thread_id,
        NEW.id,
        NEW.author_id
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_mention
  AFTER INSERT ON thread_messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_mention();

-- Auto-notify thread participants on new messages
CREATE OR REPLACE FUNCTION notify_thread_participants()
RETURNS TRIGGER AS $$
DECLARE
  participant UUID;
  thread_record RECORD;
  actor_name TEXT;
BEGIN
  SELECT * INTO thread_record FROM threads WHERE id = NEW.thread_id;
  SELECT full_name INTO actor_name FROM profiles WHERE id = NEW.author_id;

  FOR participant IN
    SELECT DISTINCT author_id FROM thread_messages
    WHERE thread_id = NEW.thread_id AND author_id != NEW.author_id
  LOOP
    -- Skip if already notified via mention trigger
    IF NOT (NEW.mentions @> ARRAY[participant]) THEN
      INSERT INTO notifications (workspace_id, recipient_id, type, title, body, thread_id, message_id, actor_id)
      VALUES (
        thread_record.workspace_id,
        participant,
        'reply',
        actor_name || ' heeft gereageerd in een thread',
        LEFT(NEW.content, 100),
        NEW.thread_id,
        NEW.id,
        NEW.author_id
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_thread_participants
  AFTER INSERT ON thread_messages
  FOR EACH ROW EXECUTE FUNCTION notify_thread_participants();

-- =============================================================================
-- Supabase Storage Bucket
-- =============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('thread-attachments', 'thread-attachments', false)
ON CONFLICT DO NOTHING;

CREATE POLICY thread_attachments_storage_upload ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'thread-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY thread_attachments_storage_read ON storage.objects
  FOR SELECT USING (bucket_id = 'thread-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY thread_attachments_storage_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'thread-attachments' AND auth.uid() = owner);

-- =============================================================================
-- Enable Realtime for threads and notifications
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE thread_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
