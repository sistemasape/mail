import { useAppStore } from '../../store/useAppStore'
import { Folder } from '../../hooks/useEmails'
import { Inbox, Send, FileText, Trash2, AlertOctagon, LogOut, PenSquare, Menu } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { EmailList } from '../EmailList/EmailList'
import { EmailDetail } from '../EmailDetail/EmailDetail'
import { Compose } from '../Compose/Compose'
import { useState } from 'react'

export function Layout() {
  const { activeFolder, setActiveFolder, setComposeOpen, isComposeOpen, user } = useAppStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const folders: { id: Folder; label: string; icon: any }[] = [
    { id: 'inbox', label: 'Caixa de Entrada', icon: Inbox },
    { id: 'sent', label: 'Enviados', icon: Send },
    { id: 'drafts', label: 'Rascunhos', icon: FileText },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
    { id: 'spam', label: 'Spam', icon: AlertOctagon },
  ]

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden text-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden absolute top-4 left-4 z-50 p-2 glass rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform fixed md:static z-40 w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col`}>
        <div className="p-4">
          <button
            onClick={() => setComposeOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <PenSquare className="w-5 h-5" />
            Nova Mensagem
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {folders.map((folder) => {
              const Icon = folder.icon
              const isActive = activeFolder === folder.id
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id)
                    setIsSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                  {folder.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold uppercase">
              {user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content Area (Email List & Detail) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="w-full md:w-[350px] lg:w-[400px] border-r border-gray-800 flex flex-col bg-gray-900/50">
          <EmailList />
        </div>
        <div className="hidden md:flex flex-1 flex-col bg-gray-950">
          <EmailDetail />
        </div>
      </div>

      {isComposeOpen && <Compose />}
    </div>
  )
}
