import { create } from 'zustand'
import { Folder, Email } from '../hooks/useEmails'
import { User } from '@supabase/supabase-js'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  activeFolder: Folder
  setActiveFolder: (folder: Folder) => void
  selectedEmail: Email | null
  setSelectedEmail: (email: Email | null) => void
  isComposeOpen: boolean
  setComposeOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  activeFolder: 'inbox',
  setActiveFolder: (folder) => set({ activeFolder: folder, selectedEmail: null, searchQuery: '' }),
  selectedEmail: null,
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  isComposeOpen: false,
  setComposeOpen: (open) => set({ isComposeOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
