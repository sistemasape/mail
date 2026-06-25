import { useAppStore } from '../../store/useAppStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Archive, Trash2, Star, Reply, MoreVertical, User, ArrowLeft } from 'lucide-react'
import { markAsRead, moveToTrash, toggleStar } from '../../hooks/useEmails'
import { useEffect } from 'react'

export function EmailDetail() {
  const { selectedEmail, setSelectedEmail } = useAppStore()

  useEffect(() => {
    if (selectedEmail && !selectedEmail.is_read) {
      markAsRead(selectedEmail.id).then(() => {
        // Optimistic UI update could be handled here or via the realtime subscription
      })
    }
  }, [selectedEmail])

  if (!selectedEmail) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-700" />
          </div>
          <p>Selecione um e-mail para ler</p>
        </div>
      </div>
    )
  }

  const handleTrash = async () => {
    await moveToTrash(selectedEmail.id)
    setSelectedEmail(null)
  }

  const handleStar = async () => {
    await toggleStar(selectedEmail.id, selectedEmail.is_starred)
    setSelectedEmail({ ...selectedEmail, is_starred: !selectedEmail.is_starred })
  }

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Toolbar */}
      <div className="h-16 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setSelectedEmail(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleTrash}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Mover para lixeira"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">
            <Archive className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline-block">
            {format(new Date(selectedEmail.created_at), "d 'de' MMMM, HH:mm", { locale: ptBR })}
          </span>
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-100 mt-1">
              {selectedEmail.subject || '(Sem assunto)'}
            </h1>
          </div>

          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {selectedEmail.sender_name[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200">{selectedEmail.sender_name}</span>
                  <span className="text-sm text-gray-500">&lt;{selectedEmail.sender_addr}&gt;</span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Para: {selectedEmail.recipients.join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleStar}
                className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
              >
                <Star className={`w-5 h-5 ${selectedEmail.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                <Reply className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {selectedEmail.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
