import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ADMIN_USERNAMES = ['rob.onetop', 'josh.onetop', 'bry.onetop']
const ALL_ENGINEER_USERNAMES = [
  'nowiel.onetop', 'rob.onetop', 'felix.onetop', 'pong.onetop',
  'keith.onetop', 'josh.onetop', 'rey.onetop', 'gerson.onetop', 'bry.onetop'
]

export default function AnnouncementManager() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('/dashboard')
  const [sending, setSending] = useState(false)
  const [sentMessage, setSentMessage] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (!stored) { navigate('/'); return }
    const userData = JSON.parse(stored)
    setUser(userData)
    const admin = userData.role === 'admin' || ADMIN_USERNAMES.includes(userData.username)
    setIsAdmin(admin)
    
    if (!admin) {
      navigate('/dashboard')
      return
    }
    
    fetchAnnouncements()
  }, [navigate])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      setAnnouncements(data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const sendAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      setSentMessage({ type: 'error', text: 'Please enter title and message' })
      setTimeout(() => setSentMessage(null), 3000)
      return
    }
    
    setSending(true)
    setSentMessage(null)
    
    try {
      for (const username of ALL_ENGINEER_USERNAMES) {
        await supabase.from('announcements').insert({
          username: username,
          title: title.trim(),
          message: message.trim(),
          link: link || '/dashboard',
          is_read: false,
          created_at: new Date().toISOString(),
        })
      }
      
      setSentMessage({ type: 'success', text: 'Announcement sent to all engineers!' })
      setTimeout(() => setSentMessage(null), 3000)
      
      setTitle('')
      setMessage('')
      setLink('/dashboard')
      fetchAnnouncements()
    } catch (err) {
      console.error(err)
      setSentMessage({ type: 'error', text: 'Failed to send: ' + err.message })
    }
    setSending(false)
  }

  const deleteAnnouncement = async (id) => {
    try {
      await supabase.from('announcements').delete().eq('id', id)
      fetchAnnouncements()
    } catch (err) { console.error(err) }
  }

  if (!isAdmin) return null

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Send announcements to all engineers</p>
      </div>

      {/* Create Announcement Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 mb-4 md:mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">New Announcement</h3>
        
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g., Team Meeting Reminder"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Message</label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              rows={4} 
              placeholder="Enter announcement message..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon resize-none" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Link (optional)</label>
            <select 
              value={link} 
              onChange={e => setLink(e.target.value)} 
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none"
            >
              <option value="/dashboard">Dashboard</option>
              <option value="/coa">COA Calendar</option>
              <option value="/concerns">Customer Concerns</option>
              <option value="/deployment">Deployment</option>
              <option value="/my-dwar">My DWAR</option>
              <option value="/my-soa">My SOA</option>
              <option value="/feedback">Feedback</option>
            </select>
          </div>
        </div>

        {sentMessage && (
          <div className={`mt-3 px-3 py-2 rounded-xl text-xs font-medium ${
            sentMessage.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {sentMessage.type === 'success' ? '✓ ' : '✗ '}
            {sentMessage.text}
          </div>
        )}

        <button 
          onClick={sendAnnouncement} 
          disabled={sending} 
          className="mt-4 w-full py-3 bg-maroon text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={14} /> {sending ? 'Sending...' : 'Send Announcement'}
        </button>
      </div>

      {/* Previous Announcements */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Previous Announcements</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-400 text-sm">No announcements yet</div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {announcements.map(ann => (
              <div key={ann.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ann.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(ann.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button 
                  onClick={() => deleteAnnouncement(ann.id)} 
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}