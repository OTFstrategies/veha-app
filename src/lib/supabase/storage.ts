import { createClient } from './client'

const BUCKET_NAME = 'thread-attachments'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]

// =============================================================================
// Upload
// =============================================================================

export async function uploadThreadAttachment(
  file: File,
  threadId: string
): Promise<{ storagePath: string; fileName: string; fileSize: number; fileType: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Bestand is te groot (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)`)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Dit bestandstype is niet toegestaan')
  }

  const supabase = createClient()
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${threadId}/${timestamp}_${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error(`Upload mislukt: ${error.message}`)

  return {
    storagePath,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  }
}

// =============================================================================
// Get URL
// =============================================================================

export async function getAttachmentUrl(storagePath: string): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600) // 1 hour expiry

  if (error) return null
  return data.signedUrl
}

// =============================================================================
// Delete
// =============================================================================

export async function deleteAttachment(storagePath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath])

  if (error) throw new Error(`Verwijderen mislukt: ${error.message}`)
}
