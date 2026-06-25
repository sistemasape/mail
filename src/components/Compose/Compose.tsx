import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { sendEmail } from '../../hooks/useEmails'
import { X, Send, Paperclip, Loader2 } from 'lucide-react'

export function Compose() {
  const { setComposeOpen } = useAppStore()
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Split recipients by comma and trim
      const recipients = to.split(',').map((email) => email.trim()).filter(Boolean)
      
      await sendEmail({
        recipients,
        subject,
        body
      })
      setComposeOpen(false)
    } catch (err) {
      alert('Erro ao enviar e-mail: ' + err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end md:justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full md:w-[600px] h-[80vh] md:h-auto md:max-h-[80vh] bg-gray-900 border border-gray-800 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-950 border-b border-gray-800">
          <h3 className="font-semibold text-gray-200">Nova Mensagem</h3>
          <button 
            onClick={() => setComposeOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <label className="text-gray-500 w-12 text-sm">Para</label>
            <input 
              type="text" 
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@exemplo.com, outro@exemplo.com"
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 text-sm placeholder-gray-600"
            />
          </div>
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <label className="text-gray-500 w-12 text-sm">Assunto</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 text-sm font-medium"
            />
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <textarea 
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-300 resize-none"
              placeholder="Escreva sua mensagem aqui..."
            />
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
            <button 
              type="button"
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-medium transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Enviar
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
