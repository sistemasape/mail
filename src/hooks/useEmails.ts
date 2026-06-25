// src/hooks/useEmails.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type Folder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam'

export interface Email {
  id: string
  folder: Folder
  sender_name: string
  sender_addr: string
  recipients: string[]
  subject: string
  body: string
  is_read: boolean
  is_starred: boolean
  labels: string[]
  created_at: string
}

export function useEmails(folder: Folder) {
  const [emails, setEmails]   = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('folder', folder)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setEmails(data ?? [])
    setLoading(false)
  }, [folder])

  useEffect(() => {
    fetchEmails()

    // Realtime: novas mensagens chegam automaticamente
    const channel = supabase
      .channel(`emails:${folder}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emails', filter: `folder=eq.${folder}` },
        async (payload) => {
          fetchEmails()
          // Tauri Desktop Notification
          if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
            try {
              const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/plugin-notification');
              let permissionGranted = await isPermissionGranted();
              if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === 'granted';
              }
              if (permissionGranted) {
                sendNotification({
                  title: `Novo e-mail de ${(payload.new as Email).sender_name}`,
                  body: (payload.new as Email).subject || '(Sem assunto)',
                });
              }
            } catch (err) {
              console.error('Erro na notificação Tauri:', err);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emails', filter: `folder=eq.${folder}` },
        () => fetchEmails()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'emails', filter: `folder=eq.${folder}` },
        () => fetchEmails()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [folder, fetchEmails])

  return { emails, loading, error, refetch: fetchEmails }
}

// ── Actions ────────────────────────────────────────────────

export async function markAsRead(id: string) {
  return supabase.from('emails').update({ is_read: true }).eq('id', id)
}

export async function moveToTrash(id: string) {
  return supabase.from('emails').update({ folder: 'trash' }).eq('id', id)
}

export async function toggleStar(id: string, current: boolean) {
  return supabase.from('emails').update({ is_starred: !current }).eq('id', id)
}

export async function sendEmail(payload: {
  recipients: string[]
  subject: string
  body: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const senderName = user.user_metadata?.full_name ?? user.email

  // 1. Salva na pasta "enviados" do remetente
  const dbResult = await supabase.from('emails').insert({
    user_id:     user.id,
    folder:      'sent',
    sender_addr: user.email,
    sender_name: senderName,
    recipients:  payload.recipients,
    subject:     payload.subject,
    body:        payload.body,
    is_read:     true,
  })

  if (dbResult.error) throw dbResult.error

  // 2. Chama a Edge Function para enviar e-mail real para o mundo externo
  const { error: edgeError } = await supabase.functions.invoke('send-email', {
    body: {
      recipients: payload.recipients,
      subject: payload.subject,
      body: payload.body,
      sender_name: senderName,
      sender_addr: user.email
    }
  })

  if (edgeError) {
    console.warn("Falha ao enviar externamente via Edge Function:", edgeError)
  }

  return dbResult
}

export async function searchEmails(query: string) {
  return supabase
    .from('emails')
    .select('*')
    .textSearch('fts', query, { config: 'portuguese' })
    .order('created_at', { ascending: false })
}
